type NavigationItem = {
  disabled?: boolean;
  href: string;
  icon: string;
  label: string;
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    icon: "D",
    label: "Dashboard"
  },
  {
    href: "/prospeccao",
    icon: "P",
    label: "Prospecção"
  },
  {
    href: "/leads",
    icon: "L",
    label: "Leads"
  },
  {
    href: "/empresas",
    icon: "E",
    label: "Empresas"
  },
  {
    href: "/pipeline",
    icon: "F",
    label: "Pipeline"
  },
  {
    href: "/mensagens",
    icon: "M",
    label: "Mensagens"
  },
  {
    href: "/copiloto",
    icon: "W",
    label: "Copiloto WhatsApp"
  },
  {
    href: "/follow-up",
    icon: "U",
    label: "Follow-up"
  },
  {
    href: "/reunioes",
    icon: "R",
    label: "Reuniões"
  },
  {
    href: "/atividades",
    icon: "A",
    label: "Atividades"
  },
  {
    href: "/configuracoes",
    icon: "C",
    label: "Configurações"
  }
] as const;
