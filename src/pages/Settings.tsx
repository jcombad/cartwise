import { SectionTitle } from "@/components/common/SectionTitle";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function Settings() {
  return (
    <div className="space-y-6">

      <SectionTitle
        title="Definições"
        subtitle="Preferências da aplicação"
      />

      <ThemeToggle />

    </div>
  );
}