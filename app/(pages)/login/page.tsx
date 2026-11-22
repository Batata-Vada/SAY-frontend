const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001";

export default function Login() {
    return (
        <main className="grid min-h-[calc(100vh-4rem)] bg-neutral-950 text-white lg:grid-cols-2">
            <section className="relative flex min-h-[45vh] flex-col justify-between overflow-hidden border-b border-neutral-800 px-8 py-10 sm:px-12 lg:min-h-full lg:border-b-0 lg:border-r lg:px-16 lg:py-14">
                <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-green-500/10 blur-3xl" />

                <a href="/" className="relative text-xl font-semibold tracking-tight">
                    SAY<span className="text-green-400">.</span>
                </a>

                <div className="relative my-16 max-w-xl lg:my-0">
                    <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-green-400">
                        Simplifying Algorithms for You
                    </p>
                    <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl xl:text-6xl">
                        Find your next challenge.
                    </h1>
                    <p className="mt-6 max-w-lg text-base leading-7 text-neutral-400 sm:text-lg">
                        Practice algorithms with problems that adapt to your progress.
                        Sign in securely with your Codeforces account to get started.
                    </p>

                    <div className="mt-12 border-l-2 border-green-500 pl-5">
                        <p className="text-sm font-medium text-neutral-200">
                            One starting point. A path shaped around you.
                        </p>
                        <p className="mt-2 text-sm text-neutral-500">
                            Learn. Solve. Grow.
                        </p>
                    </div>
                </div>

                <p className="relative text-xs text-neutral-600">
                    © SAY · Simplifying Algorithms for You
                </p>
            </section>

            <section className="flex items-center justify-center px-6 py-16 sm:px-12">
                <div className="w-full max-w-md">
                    <p className="text-sm font-medium text-green-400">Welcome to SAY</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                        Sign in to continue
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-400">
                        Use Codeforces to securely sign in. If this is your first time,
                        your SAY account will be created automatically.
                    </p>

                    <a
                        href={`${API_URL}/auth/codeforces/login`}
                        className="mt-9 flex h-12 w-full items-center justify-center gap-3 bg-green-500 px-5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
                    >
                        Continue with Codeforces
                        <span aria-hidden="true">→</span>
                    </a>

                    <p className="mt-5 text-center text-xs leading-5 text-neutral-500">
                        You’ll be redirected to Codeforces to authorize your sign in.
                    </p>
                </div>
            </section>
        </main>
    );
}
