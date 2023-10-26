javascript: $("div.board-header-btns").append(
  '<button id="trelloDailyScrum_btn" class="_2ZNy4w8Nfa58d1" style="padding: 3px; height: auto; display: inline-block;">Wait...</button>'
)
var trelloDailyScrum_next,
  trelloDailyScrum_thelist,
  trelloDailyScrum_btn = $("button#trelloDailyScrum_btn")[0]
function trelloDailyScrum_init() {
  ;(trelloDailyScrum_next = 0),
    (trelloDailyScrum_btn.innerHTML = "Stand up!"),
    $("a.list-card").fadeIn()
}
function trelloDailyScrum_format(t, l) {
  return (
    "<strong>Now: " +
    t +
    "</strong><br><small style='font-weight:normal'>Click " +
    ("" == l ? "to end the meeting" : "for next: " + l) +
    "</small>"
  )
}
function trelloDailyScrum_getStandupMembers() {
  var t = new Array()
  return (
    $("textarea[aria-label='Stand-up Members']")
      .parent()
      .parent()
      .find("div[data-idmem]")
      .each(function () {
        var l = { name: "", id: "" }
        ;(l.name = this.parentNode.parentNode
          .querySelector("span.list-card-title")
          .textContent.match(/^#\d+(.+)/)[1]),
          (l.id = this.getAttribute("data-idmem")),
          t.push(l)
      }),
    t
  )
}
trelloDailyScrum_btn.addEventListener("click", function () {
  ;(trelloDailyScrum_thelist = trelloDailyScrum_getStandupMembers()),
    trelloDailyScrum_next != trelloDailyScrum_thelist.length
      ? ($("a.list-card").fadeOut(500),
        $("a.list-card")
          .has(
            "div.member[data-idmem='" +
              trelloDailyScrum_thelist[trelloDailyScrum_next].id +
              "']"
          )
          .fadeIn(500),
        (nowName = trelloDailyScrum_thelist[trelloDailyScrum_next].name),
        (nextName =
          ++trelloDailyScrum_next == trelloDailyScrum_thelist.length
            ? ""
            : trelloDailyScrum_thelist[trelloDailyScrum_next].name),
        (trelloDailyScrum_btn.innerHTML = trelloDailyScrum_format(
          nowName,
          nextName
        )))
      : trelloDailyScrum_init()
}),
  trelloDailyScrum_init()
