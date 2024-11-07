import React, { useEffect } from "react"
import { View } from "react-native"
import AssessmentSlide from "./AssessmentSlide"
import ActivitySlide from "./ActivitySlide"
import { Slide } from "../../types"
import VideoComponent from "./VideoComponent"
import styles from "@/styles/styles"
import { useModuleStore } from "@/store/moduleStore"

export interface SlideProps {
  slide: Slide
  index: number
}

const SlideComponent = ({
  slide,
  isActive,
  index,
}: {
  slide: Slide
  isActive: boolean
  index: number
}) => {
  switch (slide.type) {
    case "Assessment":
      return <AssessmentSlide slide={slide} index={index} />
    case "Activity":
      return <ActivitySlide slide={slide} index={index} />
    case "Content":
      if (slide.content_info.type === "Video") {
        return (
          <VideoComponent
            url={slide.content_info.url}
			index={index}
          />
        )
      }
      return <View />
    default:
      return <View />
  }
}

export default function SlideRenderer({ slide, index }: SlideProps) {
  const { currentSlideIndex, setSubmittableState, checkSlideCompletion } = useModuleStore()
  const isActive = currentSlideIndex === index;
  
  useEffect(() => {
    if (isActive && slide.type !== "Assessment") {
      setSubmittableState(currentSlideIndex, false)
    }
  }, [currentSlideIndex, setSubmittableState])

  useEffect(() => {
	if (isActive && slide.type === "Content" && slide.content_info.type !== "Video") {
	  checkSlideCompletion({viewed: true})
	}
  },[currentSlideIndex])

  return (
    <View style={styles.slideRenderer}>
      <SlideComponent 
        slide={slide} 
        isActive={isActive} 
        index={index} 
      />
    </View>
  )
}