import { Story } from "@storybook/react"
import { useState } from "react"
import { defaultBoardState, WhiteBoardModel, WhiteboardUIKitStore } from "./store"

class FakeStore extends WhiteboardUIKitStore {
  constructor(v: WhiteBoardModel = defaultBoardState) {
    super(v)
  }
  handleSendText(): Promise<void> {
    throw new Error("Method not implemented.")
  }
  refreshMessageList(): Promise<void> {
    throw new Error("Method not implemented.")
  }
  toggleMinimize(): Promise<void> {
    throw new Error("Method not implemented.")
  }
}

export const BoardStory: Story<any> = () => {

  const [store] = useState<WhiteboardUIKitStore>(() => new FakeStore())

  return (
    <WhiteboardContainer store={store} />
  )
}