import { useState } from "react";

/**
 * AuthStatus
 * ログイン中/未ログインの状態だけを表示するUIコンポーネント。
 * 実際の認証処理は行わず、内部stateのトグルでUIを切り替えるだけ。
 */
export default function AuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-[240px] w-full flex items-center justify-center bg-neutral-950 p-8">
      <div className="w-full max-w-xs bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        {isLoggedIn ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm text-neutral-300 tracking-wide">
                ログイン中
              </span>
            </div>

            <button
              onClick={() => setIsLoggedIn(false)}
              className="w-full py-2.5 text-sm font-medium text-neutral-300 bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 hover:text-white transition-colors"
            >
              ログアウト
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsLoggedIn(true)}
            className="w-full py-2.5 text-sm font-medium text-neutral-950 bg-neutral-100 rounded-md hover:bg-white transition-colors"
          >
            ログイン
          </button>
        )}
      </div>
    </div>
  );
}
