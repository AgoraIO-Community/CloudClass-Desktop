import { ZoomItemType } from "@/ui-kit/components"
import { Story } from "@storybook/react"
import { useState } from "react"
import { model, WhiteBoardModel, WhiteboardUIKitStore } from "./store"
import {WhiteboardContainer} from '.'
import {Content} from '~components/layout'

export default {
  title: 'Capabilities/Board'
}

class FakeStore extends WhiteboardUIKitStore {
  handleZoomControllerChange(type: ZoomItemType): unknown {
    throw new Error("Method not implemented.")
  }
  mount(dom: HTMLElement | null): void {
    throw new Error("Method not implemented.")
  }
  unmount(): void {
    throw new Error("Method not implemented.")
  }
  constructor(v: WhiteBoardModel = model) {
    super(v)
  }
}

export const BoardStory: Story<any> = () => {

  const [store] = useState<WhiteboardUIKitStore>(() => new FakeStore())

  return (
    <Content>
      <WhiteboardContainer store={store} />
    </Content>
  )
}