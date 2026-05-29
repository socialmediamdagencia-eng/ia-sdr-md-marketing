type NavigationItem = {
  label: string;
  href: string;
  icon: string;
  disabled?: boolean;
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "D"
  },
  {
    label: "Prospecção",
    href: "/prospeccao",
    icon: "P"
  },
  {
    label: "Leads",
    href: "/leads",
    icon: "L"
  },
  {
    label: "Empresas",
    href: "/empresas",
    icon: "E"
  },
  {
    label: "Pipeline",
    href: "/pipeline",
    icon: "F"
  },
  {
    label: "Mensagens",
    href: "/mensagens",
    icon: "M"
  },
  {
    label: "Reuniões",
    href: "/reunioes",
    icon: "R"
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: "C"
  }
] as const;
