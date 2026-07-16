import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Administrator Sign In | JAZ",
    description: "JAZ operations hub sign in",
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
