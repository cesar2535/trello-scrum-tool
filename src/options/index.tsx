import { useStorage } from "@plasmohq/storage/hook";
import "~styles/global.css";
import "./index.css";

export default function OptionsIndex() {
  const [columnLabel, setLabel] = useStorage<string>("cards-column-label", "");

  return (
    <div className="min-h-full bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Setup the name of member cards column
          </h1>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div>
            <label
              htmlFor="cards-column-name"
              className="block text-sm font-medium leading-6 text-gray-900">
              The name of Member cards column
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <input
                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                id="cards-column-name"
                type="text"
                value={columnLabel}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
