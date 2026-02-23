import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "تسجيل دخول المدير | JAZ",
    description: "لوحة تحكم JAZ",
};

export default function AdminLoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="admin-login-wrapper">
            {children}
        </div>
    );
}
