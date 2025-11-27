import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { Icon } from "@iconify/react/dist/iconify.js";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (password: string) => Promise<boolean>;
  title?: string;
}

export const PasswordModal = ({
  isOpen,
  onClose,
  onVerify,
  title = "密码验证",
}: PasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleVerify = async () => {
    if (!password.trim()) {
      setError("请输入密码");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isValid = await onVerify(password);
      if (isValid) {
        handleClose();
      } else {
        setError("密码错误，请重试");
      }
    } catch (e) {
      setError("验证失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    setIsLoading(false);
    setIsVisible(false);
    onClose();
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} placement="center">
      <ModalContent>
        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
          <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
          <ModalBody>
            <Input
              autoFocus
              label="密码"
              placeholder="请输入密码"
              variant="bordered"
              value={password}
              onValueChange={setPassword}
              isInvalid={!!error}
              errorMessage={error}
              type={isVisible ? "text" : "password"}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <Icon
                      icon="solar:eye-closed-linear"
                      className="text-2xl text-default-400 pointer-events-none"
                    />
                  ) : (
                    <Icon
                      icon="solar:eye-linear"
                      className="text-2xl text-default-400 pointer-events-none"
                    />
                  )}
                </button>
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleClose} type="button">
              取消
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isLoading}
              isDisabled={!password.trim()}
            >
              确认
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
