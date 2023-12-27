import { assign, createMachine, fromCallback, fromPromise } from "xstate";
import type { Context, Events, Guards, Input } from "./machine-types";

export const standupMachine = createMachine(
  {
    types: {} as {
      context: Context;
      events: Events;
      guards: Guards;
      input: Input;
    },
    id: "standup",
    context: ({ input }) => ({
      isLegacy: false,
      index: null,
      members: [],
      columnLabel: input.columnLabel
    }),
    initial: "initializing",
    states: {
      initializing: {
        invoke: {
          id: "initialize",
          src: "initialize"
        },
        on: {
          done: {
            target: "active",
            actions: assign(({ event }) => ({
              isLegacy: event.params.isLegacy
            }))
          }
        }
      },
      active: {
        initial: "idle",
        states: {
          idle: {
            on: {
              next: [
                {
                  target: "fetchList",
                  guard: "noMembers"
                },
                {
                  target: "queuing",
                  actions: "enqueue"
                }
              ]
            }
          },
          fetchList: {
            invoke: {
              id: "fetch-cards",
              src: "fetchList",
              input: ({ context }) => ({
                isLegacy: context.isLegacy,
                columnLabel: context.columnLabel
              }),
              onDone: {
                target: "queuing",
                actions: [
                  assign(({ event }) => ({ members: event.output })),
                  { type: "enqueue" }
                ]
              },
              onError: {
                target: "error"
              }
            }
          },
          error: {
            on: { next: { target: "fetchList" } }
          },
          queuing: {
            on: {
              next: [
                {
                  target: "idle",
                  guard: "isLast",
                  actions: "enqueue"
                },
                { actions: "enqueue" }
              ]
            }
          }
        }
      }
    }
  },
  {
    actions: {
      enqueue: assign(({ context }) => {
        const index = context.index === null ? 0 : context.index + 1;
        const isLast = index === context.members.length;
        const currentMember = context.members[index];
        const memberId = currentMember?.id;
        const selector = context.isLegacy
          ? `div.member[data-idmem='${memberId}']`
          : `button[title='${memberId}']`;
        const cardSelector = context.isLegacy
          ? "a.list-card"
          : "li[data-testid='list-card']";

        if (isLast) {
          $(cardSelector).fadeIn(500);
          return { index: null };
        } else {
          $(cardSelector).fadeOut(500);
          $(cardSelector).has(selector).fadeIn(500);
          return { index };
        }
      })
    },
    actors: {
      initialize: fromCallback(({ sendBack }) => {
        const match = window.location.pathname.match(/\/([\w-]+)$/);

        if (!match) {
          sendBack({ type: "error" });
          return;
        }

        const observer = new MutationObserver(function (mutations, observer) {
          const buttonWrapper = document.querySelector("div.board-header-btns");

          if (buttonWrapper) {
            const isLegacy = $("a.list-card").length > 0;
            sendBack({ type: "done", params: { isLegacy } });
            observer.disconnect();
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
          observer.disconnect();
        };
      }),
      fetchList: fromPromise(async ({ input }: { input: Input }) => {
        const isLegacy = input.isLegacy;
        const cardSelector = isLegacy
          ? "a.list-card"
          : "li[data-testid='list-card']";
        const listSelector = isLegacy
          ? ".js-list-content"
          : "div[data-testid='list']";

        const columnSelector = `textarea[aria-label='${input.columnLabel}']`;
        const $cards = $(columnSelector)
          .closest(listSelector)
          .find(cardSelector);

        function fetchName(element: HTMLElement) {
          if (isLegacy) {
            return element
              .querySelector("span.list-card-title")
              ?.textContent?.match(/^#\d+(.+)/)?.[1];
          }

          return element.querySelector("a[data-testid='card-name']")
            ?.textContent;
        }

        function fetchId(element: HTMLElement) {
          const selector = isLegacy
            ? "div[data-idmem]"
            : "button[data-testid='card-front-member']";
          const attrName = isLegacy ? "data-idmem" : "title";
          return $(element).find(selector).attr(attrName);
        }

        if ($cards.length === 0) {
          throw new Error("No cards matched");
        }

        return $cards.map((idx, element) => {
          const id = fetchId(element);
          const name = fetchName(element);

          return { id, name };
        });
      })
    },
    guards: {
      isLast: ({ context }) => {
        if (!context.members.length) {
          return false;
        }

        const lastIdx = context.members.length - 1;
        return context.index === lastIdx;
      },
      noMembers: ({ context }) => !context.members.length
    }
  }
);
