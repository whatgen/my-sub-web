'use client'

import { useCallback, useState, useEffect } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tab,
  Tabs,
  Textarea,
} from "@nextui-org/react";
import { Icon } from '@iconify/react/dist/iconify.js';

import { toast } from "sonner";
import copy from 'copy-to-clipboard';

import { config as cfg } from '@/config'

import { TextCell } from "@/components/TextCell";
import { InputCell } from "@/components/InputCell";
import { SwitchCell } from "@/components/SwitchCell";
import { SwitchTheme } from "@/components/SwitchTheme";
import { TextModeForm } from "@/components/TextModeForm";
import { SavedSubsList } from "@/components/SavedSubsList";
import { PasswordModal } from "@/components/PasswordModal";

import { createSub } from "@/app/hooks/createSub";
import { createShortSub } from "@/app/hooks/createShortSub";
import { uploadSubContent } from "@/app/hooks/uploadSubContent";
import {
  loadSubscriptions,
  saveSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionById,
} from "@/app/hooks/useLocalStorage";
import { hashPassword, verifyPassword } from "@/app/utils/crypto";

const backends = process.env.NEXT_PUBLIC_BACKENDS?.split('|') ?? ["http://127.0.0.1:25500/sub?"]
const initialParams: Params = {
  mode: 'easy',
  subLink: '',
  shortSubLink: '',
  shortSubLoading: false,
  backend: backends[0],
  url: '',
  target: '',
  config: '',
  include: '',
  exclude: '',
  tfo: false,
  udp: false,
  scv: false,
  append_type: false,
  emoji: false,
  list: false,
};

export default function Home() {
  const tabs = [
    {
      key: 'easy',
      label: '简单模式',
      icon: 'solar:cat-linear',
    },
    {
      key: 'hard',
      label: '进阶模式',
      icon: 'solar:winrar-linear',
    },
    {
      key: 'text',
      label: '文本模式',
      icon: 'solar:document-text-linear',
    },
  ];

  const [params, setParams] = useState(initialParams)
  const [textModeParams, setTextModeParams] = useState<TextModeParams>({
    title: '',
    content: '',
    hasPassword: false,
    password: '',
    selectedId: null,
  })
  const [savedSubs, setSavedSubs] = useState<SavedSubscription[]>([])
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordModalAction, setPasswordModalAction] = useState<'edit' | 'delete'>('edit')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [actionTargetId, setActionTargetId] = useState<string | null>(null)
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false)
  // Track verified subscriptions in current session (memory only, not persisted)
  const [verifiedSubscriptions, setVerifiedSubscriptions] = useState<Set<string>>(new Set())

  // Load subscriptions on mount
  useEffect(() => {
    const subs = loadSubscriptions();
    setSavedSubs(subs);
  }, [])

  const createSubscription = useCallback(async () => {
    try {
      // Handle text mode
      if (params.mode === 'text') {
        const content = textModeParams.content.trim();
        if (!content) {
          throw new Error('请输入订阅内容');
        }

        // Check if there's already a subscription link
        if (params.subLink) {
          // Show confirmation modal
          setRegenerateModalOpen(true);
          return;
        }

        // Generate new subscription link
        await generateTextModeSubscription();
        return;
      }

      // Handle easy and hard mode
      const subLink = createSub(params)
      copy(subLink)
      toast.success('定制订阅已复制到剪贴板')

      setParams(prevParams => ({ ...prevParams, subLink }))
    } catch (e) {
      toast.error((e as Error).message)
    }
  }, [params, textModeParams.content, textModeParams.selectedId])

  // Separate function to generate text mode subscription
  const generateTextModeSubscription = useCallback(async () => {
    try {
      const content = textModeParams.content.trim();
      if (!content) {
        throw new Error('请输入订阅内容');
      }

      // Extract old file ID if exists
      let oldFileId: string | undefined;
      if (params.subLink) {
        const match = params.subLink.match(/\/api\/sub\/([^/?]+)/);
        if (match) {
          oldFileId = match[1];
        }
      }

      // Upload content to server and get URL (will delete old file if oldFileId provided)
      const subLink = await uploadSubContent(content, oldFileId);

      // If this is a saved subscription, update its subLink field
      if (textModeParams.selectedId) {
        updateSubscription(textModeParams.selectedId, { subLink });
        setSavedSubs(loadSubscriptions());
      }

      // Copy URL to clipboard
      copy(subLink);
      toast.success('订阅链接已生成并复制到剪贴板');

      // Update params with the URL
      setParams(prevParams => ({ ...prevParams, subLink, shortSubLink: '' }));
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [params.subLink, textModeParams.content, textModeParams.selectedId])

  const confirmRegenerateSubscription = useCallback(async () => {
    setRegenerateModalOpen(false);
    await generateTextModeSubscription();
  }, [generateTextModeSubscription])

  const createShortSubscription = useCallback(async () => {
    setParams(prevParams => ({ ...prevParams, shortSubLoading: true }));
    try {
      const shortSubLink = await createShortSub(params.subLink);
      copy(shortSubLink);
      toast.success('短链接已复制到剪贴板');

      // If in text mode and editing a subscription, save the short link
      if (params.mode === 'text' && textModeParams.selectedId) {
        updateSubscription(textModeParams.selectedId, { shortSubLink });
        setSavedSubs(loadSubscriptions());
      }

      setParams(prevParams => ({ ...prevParams, shortSubLink }));
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setParams(prevParams => ({ ...prevParams, shortSubLoading: false }));
    }
  }, [params.subLink, params.mode, textModeParams.selectedId]);

  const importClash = useCallback(() => {
    const { subLink, shortSubLink } = params;

    if (!subLink) return toast.error('请在生成订阅链接后再试');

    const url = shortSubLink || subLink;
    window.location.href = `clash://install-config?url=${encodeURIComponent(url)}`;
  }, [params.subLink || params.shortSubLink]);

  // Text mode handlers
  const handleSaveTextSubscription = useCallback(async () => {
    try {
      // Validate inputs
      if (!textModeParams.title.trim()) {
        toast.error('请输入标题');
        return;
      }
      if (!textModeParams.content.trim()) {
        toast.error('请输入订阅链接');
        return;
      }
      if (textModeParams.hasPassword && !textModeParams.password.trim()) {
        toast.error('请输入密码');
        return;
      }

      // Generate unique ID
      const id = crypto.randomUUID();

      // Hash password if needed
      let passwordHash: string | undefined;
      if (textModeParams.hasPassword) {
        passwordHash = await hashPassword(textModeParams.password);
      }

      // Create subscription object
      const newSub: SavedSubscription = {
        id,
        title: textModeParams.title.trim(),
        content: textModeParams.content.trim(),
        hasPassword: textModeParams.hasPassword,
        passwordHash,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save to localStorage
      saveSubscription(newSub);

      // Update state
      setSavedSubs(loadSubscriptions());

      // Keep the form with the saved subscription selected
      setTextModeParams({
        title: textModeParams.title.trim(),
        content: textModeParams.content.trim(),
        hasPassword: textModeParams.hasPassword,
        password: '', // Clear password for security
        selectedId: id,
      });

      toast.success('订阅已保存');
    } catch (error) {
      toast.error((error as Error).message || '保存失败');
    }
  }, [textModeParams]);

  const handleUpdateTextSubscription = useCallback(async () => {
    try {
      if (!textModeParams.selectedId) {
        toast.error('未选择订阅');
        return;
      }

      // Validate inputs
      if (!textModeParams.title.trim()) {
        toast.error('请输入标题');
        return;
      }
      if (!textModeParams.content.trim()) {
        toast.error('请输入订阅链接');
        return;
      }

      // Get existing subscription
      const existingSub = getSubscriptionById(textModeParams.selectedId);
      if (!existingSub) {
        toast.error('订阅不存在');
        return;
      }

      // Extract file ID from subLink
      let fileId: string | undefined;
      if (existingSub.subLink) {
        const match = existingSub.subLink.match(/\/api\/sub\/([^/?]+)/);
        if (match) {
          fileId = match[1];
        }
      }

      // Upload updated content to server (create new or update existing file)
      const newSubLink = await uploadSubContent(textModeParams.content.trim(), fileId);

      // Handle password logic
      let passwordHash: string | undefined;
      if (textModeParams.hasPassword) {
        if (textModeParams.password.trim()) {
          // User entered a new password, hash it
          passwordHash = await hashPassword(textModeParams.password);
        } else {
          // No password entered, keep the existing password hash
          passwordHash = existingSub.passwordHash;
        }
      }

      // Update subscription in localStorage
      updateSubscription(textModeParams.selectedId, {
        title: textModeParams.title.trim(),
        content: textModeParams.content.trim(),
        hasPassword: textModeParams.hasPassword,
        passwordHash,
        subLink: newSubLink,
      });

      // Update state
      setSavedSubs(loadSubscriptions());
      
      // Update params with new subLink
      setParams(prevParams => ({ 
        ...prevParams, 
        subLink: newSubLink,
        shortSubLink: '' // Clear short link as content changed
      }));

      // Keep the form with the updated subscription selected
      setTextModeParams({
        title: textModeParams.title.trim(),
        content: textModeParams.content.trim(),
        hasPassword: textModeParams.hasPassword,
        password: '', // Clear password for security
        selectedId: textModeParams.selectedId,
      });

      toast.success('订阅已更新');
    } catch (error) {
      toast.error((error as Error).message || '更新失败');
    }
  }, [textModeParams]);

  const handleClearTextForm = useCallback(() => {
    setTextModeParams({
      title: '',
      content: '',
      hasPassword: false,
      password: '',
      selectedId: null,
    });
    // Clear subLink and shortSubLink
    setParams(prevParams => ({ 
      ...prevParams, 
      subLink: '',
      shortSubLink: ''
    }));
  }, []);

  const handleEditTextSubscription = useCallback((id: string) => {
    const sub = getSubscriptionById(id);
    if (!sub) {
      toast.error('订阅不存在');
      return;
    }

    if (sub.hasPassword && !verifiedSubscriptions.has(id)) {
      // Show password modal only if not verified in current session
      setActionTargetId(id);
      setPasswordModalAction('edit');
      setPasswordModalOpen(true);
    } else {
      // Load directly (no password or already verified)
      setTextModeParams({
        title: sub.title,
        content: sub.content,
        hasPassword: sub.hasPassword,
        password: '',
        selectedId: id,
      });
      // Load subLink and shortSubLink if exist
      setParams(prevParams => ({ 
        ...prevParams, 
        subLink: sub.subLink || '',
        shortSubLink: sub.shortSubLink || ''
      }));
      
      if (sub.hasPassword && verifiedSubscriptions.has(id)) {
        toast.success('密码已验证，已加载订阅');
      } else {
        toast.success('已加载订阅');
      }
    }
  }, [verifiedSubscriptions]);

  const handlePasswordVerify = useCallback(async (password: string): Promise<boolean> => {
    if (!actionTargetId) return false;

    const sub = getSubscriptionById(actionTargetId);
    if (!sub || !sub.passwordHash) return false;

    const isValid = await verifyPassword(password, sub.passwordHash);
    if (isValid) {
      // Mark this subscription as verified in current session
      setVerifiedSubscriptions(prev => new Set(prev).add(actionTargetId));
      
      if (passwordModalAction === 'edit') {
        // Load subscription into form
        setTextModeParams({
          title: sub.title,
          content: sub.content,
          hasPassword: true,
          password: '', // Don't populate password field
          selectedId: actionTargetId,
        });
        // Load subLink and shortSubLink if exist
        setParams(prevParams => ({ 
          ...prevParams, 
          subLink: sub.subLink || '',
          shortSubLink: sub.shortSubLink || ''
        }));
        toast.success('验证成功，已加载订阅');
      } else if (passwordModalAction === 'delete') {
        // Show delete confirmation modal
        setDeleteTargetId(actionTargetId);
        setDeleteModalOpen(true);
        toast.success('验证成功');
      }
      
      setActionTargetId(null);
    }

    return isValid;
  }, [actionTargetId, passwordModalAction]);

  const handleDeleteTextSubscription = useCallback((id: string) => {
    const sub = getSubscriptionById(id);
    if (!sub) {
      toast.error('订阅不存在');
      return;
    }

    if (sub.hasPassword && !verifiedSubscriptions.has(id)) {
      // Show password modal for verification
      setActionTargetId(id);
      setPasswordModalAction('delete');
      setPasswordModalOpen(true);
    } else {
      // Show delete confirmation directly
      setDeleteTargetId(id);
      setDeleteModalOpen(true);
    }
  }, [verifiedSubscriptions]);

  const confirmDelete = useCallback(() => {
    if (!deleteTargetId) return;

    try {
      deleteSubscription(deleteTargetId);
      setSavedSubs(loadSubscriptions());

      // Clear form if deleting current selection
      if (textModeParams.selectedId === deleteTargetId) {
        setTextModeParams({
          title: '',
          content: '',
          hasPassword: false,
          password: '',
          selectedId: null,
        });
      }

      toast.success('订阅已删除');
    } catch (error) {
      toast.error((error as Error).message || '删除失败');
    } finally {
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  }, [deleteTargetId, textModeParams.selectedId]);

  return (
    <div className="w-full p-4 flex flex-col justify-center items-center gap-3">
      <Card className="w-full lg:w-1/2 md:w-2/3">
        <CardBody>
          <Tabs
            size="lg"
            fullWidth
            aria-label="Mode"
            items={tabs}
            selectedKey={params.mode}
            onSelectionChange={(key) => setParams({ ...params, mode: key.toString() as Params["mode"] })}
          >
            {(item) => (
              <Tab key={item.key} title={
                <div className="flex items-center space-x-2 font-bold">
                  <Icon icon={item.icon}></Icon>
                  <span>{item.label}</span>
                </div>
              }>
                {item.key === 'text' ? (
                  // Text mode content
                  <div className="flex flex-col gap-3">
                    <TextModeForm
                      title={textModeParams.title}
                      content={textModeParams.content}
                      hasPassword={textModeParams.hasPassword}
                      password={textModeParams.password}
                      selectedId={textModeParams.selectedId}
                      onTitleChange={(value) => setTextModeParams({ ...textModeParams, title: value })}
                      onContentChange={(value) => setTextModeParams({ ...textModeParams, content: value })}
                      onPasswordToggle={(value) => setTextModeParams({ ...textModeParams, hasPassword: value })}
                      onPasswordChange={(value) => setTextModeParams({ ...textModeParams, password: value })}
                      onSave={handleSaveTextSubscription}
                      onUpdate={handleUpdateTextSubscription}
                      onClear={handleClearTextForm}
                    />
                    <Divider className="my-2" />
                    <SavedSubsList
                      subscriptions={savedSubs}
                      selectedId={textModeParams.selectedId}
                      onEdit={handleEditTextSubscription}
                      onDelete={handleDeleteTextSubscription}
                      onNew={handleClearTextForm}
                    />
                  </div>
                ) : (
                  // Easy and Hard mode content
                  <div className="flex flex-col gap-3">
                    <Textarea
                      variant="bordered"
                      label="订阅链接"
                      placeholder="支持订阅或ss/ssr/vmess链接，多个链接每行一个或者用 | 分隔"
                      className="w-full"
                      minRows={1}
                      value={params.url}
                      onValueChange={(value) => setParams({ ...params, url: value })}
                    />
                    <Autocomplete
                      variant="bordered"
                      label="软件类型"
                      placeholder="请选择你使用的客户端类型"
                      className="w-full"
                      selectedKey={params.target}
                      onSelectionChange={(key) => setParams({ ...params, target: (key ?? '').toString() })}
                      defaultItems={Object.entries(cfg.clients)}
                    >
                      {(item => (
                        <AutocompleteItem key={item[0]}>
                          {item[0]}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                    <Autocomplete
                      variant="bordered"
                      label="后端地址"
                      placeholder="请选择或输入使用的后端地址，留空则为使用默认后端"
                      className="w-full"
                      allowsCustomValue
                      inputValue={params.backend}
                      onInputChange={(value) => setParams({ ...params, backend: value })}
                      defaultItems={backends.map(value => ({
                        value: value
                      }))}
                    >
                      {(item => (
                        <AutocompleteItem key={item.value}>
                          {item.value}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                    {/* 进阶模式 */}
                    {params.mode === 'hard' ? (<div className="flex flex-col gap-3">
                      <Autocomplete
                        variant="bordered"
                        label="远程配置"
                        placeholder="请选择或输入需要的远程配置，留空则为不需要远程配置"
                        className="w-full"
                        allowsCustomValue
                        inputValue={params.config}
                        onInputChange={(value) => setParams({ ...params, config: value })}
                        defaultItems={cfg.remoteConfig}
                      >
                        {(item => (
                          <AutocompleteSection
                            key={item.category}
                            title={item.category}
                            classNames={{
                              heading: "flex w-full sticky top-1 z-20 py-1.5 px-2 bg-default-100 shadow-small rounded-small"
                            }}
                          >
                            {item.items.map(url => (
                              <AutocompleteItem key={url.label}>
                                {url.label}
                              </AutocompleteItem>
                            ))}
                          </AutocompleteSection>
                        ))}
                      </Autocomplete>
                      <div className="flex flex-row gap-3">
                        <InputCell
                          label="包含节点"
                          value={params.include}
                          onValueChange={(value) => setParams({ ...params, include: value })}
                          placeholder="节点名包含的关键字，支持正则"
                        />
                        <InputCell
                          label="排除节点"
                          value={params.exclude}
                          onValueChange={(value) => setParams({ ...params, exclude: value })}
                          placeholder="节点名排除的关键字，支持正则"
                        />
                      </div>
                      <div className='flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 gap-3'>
                        {cfg.switchCells.map((cell) => (
                          <SwitchCell
                            key={cell.key}
                            title={cell.title}
                            isSelected={params[cell.key as keyof Params] as boolean}
                            onValueChange={(value) => setParams({ ...params, [cell.key]: value })}
                          />
                        ))}
                      </div>
                    </div>) : null}
                  </div>
                )}
              </Tab>
            )}
          </Tabs>
        </CardBody>
        <CardFooter className="flex flex-col gap-5 pt-4">
          <TextCell
            label="定制订阅"
            value={params.subLink}
            placeholder="请先输入订阅链接和选择客户端后，点击生成订阅链接"
          />
          <TextCell
            label="订阅短链"
            value={params.shortSubLink}
            placeholder="生成订阅链接后，点击生成短链"
          />
          <div
            className="w-2/3 flex flex-col gap-3"
          >
            <Button
              color="primary"
              startContent={<Icon icon="solar:link-round-angle-linear" />}
              onPress={createSubscription}
            >生成订阅链接</Button>
            <Button
              isLoading={params.shortSubLoading}
              color="primary"
              startContent={<Icon icon="solar:link-minimalistic-2-linear" />}
              onPress={createShortSubscription}
            >生成短链接</Button>
            <Button
              color="default"
              startContent={<Icon icon="solar:cloud-download-linear" />}
              onPress={importClash}
            >导入至 Clash</Button>
          </div>
        </CardFooter>
      </Card>
      <p className="text-bold text-sm text-center">
        Made with <SwitchTheme /> by <Link isExternal href="https://github.com/whatgen/my-sub-web">whatgen</Link>.
      </p>

      {/* Password verification modal */}
      <PasswordModal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setActionTargetId(null);
        }}
        onVerify={handlePasswordVerify}
        title={passwordModalAction === 'edit' ? '请输入密码以编辑订阅' : '请输入密码以删除订阅'}
      />

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">确认删除</ModalHeader>
          <ModalBody>
            <p>
              确定要删除订阅 <strong>&quot;{deleteTargetId ? getSubscriptionById(deleteTargetId)?.title : ''}&quot;</strong> 吗？
            </p>
            <p className="text-sm text-default-500">此操作无法撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={() => {
                setDeleteModalOpen(false);
                setDeleteTargetId(null);
              }}
            >
              取消
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Regenerate subscription confirmation modal */}
      <Modal
        isOpen={regenerateModalOpen}
        onClose={() => setRegenerateModalOpen(false)}
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">确认重新生成</ModalHeader>
          <ModalBody>
            <p>
              已存在订阅链接，重新生成将使旧链接失效。
            </p>
            <p className="text-sm text-default-500">确定要继续吗？</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={() => setRegenerateModalOpen(false)}
            >
              取消
            </Button>
            <Button color="warning" onPress={confirmRegenerateSubscription}>
              继续生成
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div >
  );
}
