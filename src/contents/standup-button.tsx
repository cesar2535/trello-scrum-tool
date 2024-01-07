import { useStorage } from "@plasmohq/storage/hook";
import { useActor } from "@xstate/react";
import styleText from "data-text:~styles/global.css";
import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoCSUIMountState
} from "plasmo";
import type { ButtonHTMLAttributes } from "react";
import { createRoot } from "react-dom/client";
import { standupMachine } from "~machines/standup";
import Loader from "../components/loader";

export const config: PlasmoCSConfig = {
  matches: ["https://trello.com/b/*"]
};

type GetRootContainterParams = {
  anchor: PlasmoCSUIAnchor;
  mountState: PlasmoCSUIMountState;
};
export function getRootContainer({
  anchor,
  mountState
}: GetRootContainterParams) {
  function createShadowDom() {
    const shadowHost = document.createElement("plasmo-csui");
    const shadowRoot = shadowHost.attachShadow({ mode: "open" });
    const shadowContainer = document.createElement("div");
    shadowContainer.id = "plasmo-shadow-container";
    shadowContainer.style.setProperty("z-index", "2147483647");
    shadowContainer.style.setProperty("position", "relative");

    shadowRoot.appendChild(shadowContainer);

    return {
      shadowContainer,
      shadowHost,
      shadowRoot
    };
  }

  function getStyle() {
    const style = document.createElement("style");
    style.textContent = styleText;
    return style;
  }

  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const rootContainer = document.querySelector("div.board-header-btns");

      if (rootContainer) {
        const shadowDom = createShadowDom();

        mountState?.hostSet.add(shadowDom.shadowHost);
        mountState?.hostMap.set(shadowDom.shadowHost, anchor);

        shadowDom.shadowRoot.prepend(getStyle());
        shadowDom.shadowHost.id = "way-of-shadow";

        rootContainer.insertAdjacentElement("afterend", shadowDom.shadowHost);

        clearInterval(checkInterval);
        resolve(shadowDom.shadowContainer);
      }
    }, 137);
  });
}

function StandupButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const [columnLabel] = useStorage<string>(
    "cards-column-label",
    "Stand-up Members"
  );
  const [state, send] = useActor(standupMachine, { input: { columnLabel } });

  const idx = state.context.index as number;
  const members = state.context.members;
  const currentMember = members[idx];
  const nextMember = members[idx + 1];

  return (
    <button
      className="inline-flex items-center rounded-md bg-white text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 overflow-hidden hover:bg-gray-50"
      onClick={() => send({ type: "next" })}>
      {state.matches({ active: "idle" }) && (
        <div className="px-3 py-2">
          {members.length === 0 && (
            <div>Click to load members and Standup!</div>
          )}
          {members.length > 0 && <div>Standup!</div>}
        </div>
      )}
      {state.matches({ active: "fetchList" }) && (
        <div className="px-3 py-2">
          <Loader className="h-4" />
        </div>
      )}
      {state.matches({ active: "error" }) && (
        <div className="flex flex-col gap-2 px-3 py-2">
          <div>Failed to fetch members</div>
          <div className="text-xs">Retry</div>
        </div>
      )}
      {state.matches({ active: "queuing" }) && (
        <div>
          <div className="px-3 pt-2 pb-1">{currentMember.name}</div>
          {nextMember && (
            <div className="bg-gray-200 text-xs px-3 pt-1 pb-2">
              Next to: {nextMember.name}
            </div>
          )}
          {!nextMember && (
            <div className="bg-gray-200 text-xs px-3 pt-1 pb-2">End</div>
          )}
        </div>
      )}
    </button>
  );
}

export async function render({ createRootContainer }) {
  const rootContainer = await createRootContainer();
  const root = createRoot(rootContainer);
  root.render(<StandupButton />);
}
