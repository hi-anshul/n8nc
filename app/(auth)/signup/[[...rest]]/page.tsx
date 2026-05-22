import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      <div className="w-full max-w-md space-y-6 flex flex-col items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">n8nc</h1>
          <p className="text-xs text-zinc-500">AI-assisted visual workflow automation</p>
        </div>
        <div className="w-full bg-zinc-900 border border-zinc-800/80 p-5 rounded-2xl shadow-[0_0_40px_-15px_rgba(255,255,255,0.1),_0_20px_25px_-5px_rgba(0,0,0,0.8)]">
          <SignUp
            path="/signup"
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: "#ffffff",
                colorBackground: "transparent",
                colorInputBackground: "#000000",
                colorInputText: "#fafafa",
                colorText: "#fafafa",
                colorTextSecondary: "#a1a1aa",
                colorTextMuted: "#737373",
                colorBorder: "#1f1f22",
                fontFamily: "var(--font-geist-sans), sans-serif",
              },
              elements: {
                card: "bg-transparent shadow-none border-0 !p-0 w-full",
                main: "!p-0 w-full",
                headerTitle: "!text-text-primary font-semibold text-xl",
                headerSubtitle: "!text-text-secondary",
                socialButtonsBlockButton: "!bg-white hover:!bg-zinc-200 border border-zinc-200 transition-colors w-full",
                socialButtonsBlockButtonText: "!text-black font-semibold",
                dividerLine: "bg-border-default",
                dividerText: "!text-text-muted",
                formFieldLabel: "!text-text-primary",
                formFieldInput: "bg-bg-base border border-border-default !text-text-primary focus:border-focus-ring focus:ring-1 focus:ring-focus-ring transition-all rounded-xl w-full",
                formButtonPrimary: "!bg-white hover:!bg-zinc-200 !text-black font-semibold transition-all rounded-xl w-full",
                footerActionText: "!text-text-muted",
                footerActionLink: "!text-text-primary hover:underline",
                identityPreviewText: "!text-text-primary",
                formResendCodeLink: "!text-text-primary hover:underline",
                branding: "!text-white/80 [&_svg]:!fill-white [&_svg]:!text-white [&_a]:!text-white",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}


