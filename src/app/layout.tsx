import { Metadata, Viewport } from "next";
import { Provider } from "../components/ui/provider";

export const viewport: Viewport = {
    maximumScale: 1.0,
};

export const metadata: Metadata = {
    title: "全国Q地図NEXT",
    icons: {
        icon: "https://maps.qchizu.xyz/favicon.ico",
    },
};

export default function RootLayout(props: { children: React.ReactNode }) {
    const { children } = props;
    return (
        <html lang="ja" suppressHydrationWarning>
            <body>
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
