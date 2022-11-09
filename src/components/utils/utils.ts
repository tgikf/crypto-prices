const evaluatePrice = (bid: string, ask: string) => {
  let start, end, cutoff;

  for (let i = 0; i < bid.length; i++) {
    if (bid.charAt(i) !== ask.charAt(i)) {
      start = i;
      end = ask.charAt(i + 1) !== "." ? i + 2 : i + 3;
      break;
    }
  }

  for (let i = bid.length - 1; i >= 0; i--) {
    if (bid.charAt(i) === "0" && ask.charAt(i) === "0") {
      cutoff = i;
    } else if (bid.charAt(i) === ".") {
      cutoff = i;
      break;
    } else break;
  }
  return [start, end, cutoff];
};
export default evaluatePrice;
