import { ModulePlaceholder } from "@/components/ui/module-placeholder";
import { messagingModule } from "@/modules/messaging";

export default function MessagesPage() {
  return <ModulePlaceholder module={messagingModule} />;
}
