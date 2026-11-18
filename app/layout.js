import "./globals.css";

export const metadata = {
  title: "gitignore-generator — build the perfect .gitignore",
  description:
    "Pick your stack, tools and OS. Generate a clean, ready-to-save .gitignore file in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
