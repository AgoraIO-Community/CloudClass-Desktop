import { Story } from "@storybook/react"
import { useState } from "react"
import { NavigationBarUIKitStore } from "./store"
import {NavigationBar} from '.'

class FakeStore extends NavigationBarUIKitStore {
  showDialog(type: string): void {
    throw new Error("Method not implemented.")
  }
}

export default {
  title: 'Containers/NavigationBar'
}

export const NavStory: Story<any> = () => {

  const [store] = useState<FakeStore>(() => new FakeStore())

  return (
    <div>
      <NavigationBar store={store} />
    </div>
  )
}