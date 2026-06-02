interface HomeErrorStateProps {
  message: string;
}

export function HomeErrorState({ message }: HomeErrorStateProps) {
  return (
    <div className="mx-4 flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-900 dark:bg-red-950/40 md:mx-0">
      <p className="text-lg font-semibold text-red-800 dark:text-red-300">
        No se pudieron cargar los datos
      </p>
      <p className="mt-2 max-w-md text-sm text-red-700 dark:text-red-400">
        {message}
      </p>
      <p className="mt-4 text-sm text-red-600 dark:text-red-400">
        Verifica tu conexión e intenta recargar la página.
      </p>
    </div>
  );
}
