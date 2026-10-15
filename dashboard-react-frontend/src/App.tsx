import * as React from "react"
import { LinkCardGrid } from './components/ui/LinkCardGrid'
import { TopBar } from './components/ui/TopBar'



export default function App() {
  //global isEditMode bool to show/hide buttons for editing
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false)

  return (
    <>
      <TopBar isEditMode={isEditMode} setIsEditMode={setIsEditMode} />


      <LinkCardGrid isEditMode={isEditMode} />

    </>
  )
}
