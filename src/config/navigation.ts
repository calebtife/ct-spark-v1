// Export the interface as a type
export type NavItem = {
    label: string;
    href: string;
};

// Export the navigation array
export const navigation: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: " Data Plans", href: "/plans" },
    // { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "/contact-us" }
]; 