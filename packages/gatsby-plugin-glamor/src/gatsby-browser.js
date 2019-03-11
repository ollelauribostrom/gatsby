import { rehydrate } from "glamor"

export const onClientEntry = () => {
  if (window._glamor) {
    rehydrate(window._glamor)
  }
}
