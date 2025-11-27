import { Button, Input, Textarea } from "@nextui-org/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { SwitchCell } from "./SwitchCell";

export const TextModeForm = ({
    title,
    content,
    hasPassword,
    password,
    selectedId,
    onTitleChange,
    onContentChange,
    onPasswordToggle,
    onPasswordChange,
    onSave,
    onUpdate,
    onClear,
}: {
    title: string;
    content: string;
    hasPassword: boolean;
    password: string;
    selectedId: string | null;
    onTitleChange: (value: string) => void;
    onContentChange: (value: string) => void;
    onPasswordToggle: (value: boolean) => void;
    onPasswordChange: (value: string) => void;
    onSave: () => void;
    onUpdate: () => void;
    onClear: () => void;
}) => {
    const isEditing = selectedId !== null;

    return (
        <div className="flex flex-col gap-3">
            <Input
                variant="bordered"
                label="标题"
                placeholder="请输入订阅标题"
                value={title}
                onValueChange={onTitleChange}
                isRequired
            />

            <Textarea
                variant="bordered"
                label="订阅链接"
                placeholder="请输入订阅链接文本，支持多行"
                className="w-full"
                minRows={6}
                value={content}
                onValueChange={onContentChange}
                isRequired
            />

            <div className="flex flex-row gap-3 items-end">
                <div className="flex-shrink-0">
                    <SwitchCell
                        title="设置密码"
                        isSelected={hasPassword}
                        onValueChange={onPasswordToggle}
                    />
                </div>
                {hasPassword && (
                    <Input
                        variant="bordered"
                        label="密码"
                        type="password"
                        placeholder={selectedId ? "留空保持原密码不变" : "请输入密码"}
                        value={password}
                        onValueChange={onPasswordChange}
                        isRequired={!selectedId}
                        className="flex-1"
                    />
                )}
            </div>

            <div className="flex flex-row gap-3 mt-2">
                {isEditing ? (
                    <Button
                        color="primary"
                        startContent={<Icon icon="solar:diskette-linear" />}
                        onPress={onUpdate}
                        className="flex-1"
                    >
                        更新
                    </Button>
                ) : (
                    <Button
                        color="primary"
                        startContent={<Icon icon="solar:diskette-linear" />}
                        onPress={onSave}
                        className="flex-1"
                    >
                        保存
                    </Button>
                )}
                <Button
                    color="default"
                    variant="flat"
                    startContent={<Icon icon="solar:refresh-linear" />}
                    onPress={onClear}
                    className="flex-1"
                >
                    清空
                </Button>
            </div>
        </div>
    );
};
