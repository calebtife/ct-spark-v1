// Export the interface as a type
export type NavItem = {
    label: string;
    href: string;
};

// Export the navigation array
export const navigation: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Reviews", href: "#reviews" },
    { label: "Support", href: "/support" }
]; 