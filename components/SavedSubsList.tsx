import { Button, Select, SelectItem } from "@nextui-org/react";
import { Icon } from "@iconify/react/dist/iconify.js";

interface SavedSubsListProps {
  subscriptions: SavedSubscription[];
  selectedId: string | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export const SavedSubsList = ({
  subscriptions,
  selectedId,
  onEdit,
  onDelete,
  onNew,
}: SavedSubsListProps) => {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-default-700 dark:text-default-500">
        已保存的订阅
      </p>
      
      <div className="flex gap-2">
        <Select
          placeholder={subscriptions.length === 0 ? "暂无保存的订阅" : "选择订阅"}
          className="flex-1"
          aria-label="选择订阅"
          selectedKeys={selectedId ? [selectedId] : []}
          onSelectionChange={(keys) => {
            const newSelectedId = Array.from(keys)[0] as string;
            if (newSelectedId) {
              onEdit(newSelectedId);
            }
          }}
          renderValue={(items) => {
            if (items.length === 0) return null;
            const item = items[0];
            const sub = subscriptions.find(s => s.id === item.key);
            return (
              <div className="flex items-center gap-2">
                {sub?.hasPassword && (
                  <Icon
                    icon="solar:lock-password-linear"
                    className="text-lg text-warning"
                  />
                )}
                <span className="text-sm">{item.textValue}</span>
              </div>
            );
          }}
        >
          {subscriptions.map((sub) => (
            <SelectItem
              key={sub.id}
              textValue={sub.title}
              startContent={
                sub.hasPassword ? (
                  <Icon
                    icon="solar:lock-password-linear"
                    className="text-lg text-warning"
                  />
                ) : undefined
              }
              endContent={
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => onDelete(sub.id)}
                    aria-label="删除"
                  >
                    <Icon icon="solar:trash-bin-trash-linear" className="text-base" />
                  </Button>
                </div>
              }
            >
              {sub.title}
            </SelectItem>
          ))}
        </Select>
        
        <Button
          isIconOnly
          color="primary"
          variant="flat"
          onPress={onNew}
          aria-label="新建订阅"
          className="flex-shrink-0"
        >
          <Icon icon="solar:add-circle-linear" className="text-xl" />
        </Button>
      </div>
    </div>
  );
};
