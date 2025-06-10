import { useLanguage } from "@/contexts/language-context";
import { useEffect, useState } from "react";

// Loading component with better UX
interface LoadingStateProps {
  onRetry: () => void;
  error?: string | null;
}

export function ProjectLoadingState({ error, onRetry }: LoadingStateProps) {
  const [showRetryButton, setShowRetryButton] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRetryButton(true);
    }, 10000); // Show retry button after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-red-500 text-lg font-semibold">
          {t("project_loading_error")}
        </div>
        <div className="text-gray-600 text-center max-w-md">
          {error}
        </div>
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={onRetry}
        >
          {t("try_again")}
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <div className="text-gray-600">{t("project_loading")}</div>

      {showRetryButton && (
        <button
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          onClick={onRetry}
        >
          {t("reload_project")}
        </button>
      )}
    </div>
  );
}
