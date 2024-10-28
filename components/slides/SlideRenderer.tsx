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
  nextSlide,
  index,
}: {
  slide: Slide
  isActive: boolean
  nextSlide: () => void
  index: number
}) => {
  switch (slide.type) {
    case "Assessment":
      return <AssessmentSlide slide={slide} index={index} />
    case "Activity":
      return <ActivitySlide slide={slide} />
    case "Content":
      if (slide.content_info.type === "Video") {
        return (
          <VideoComponent
            url={slide.content_info.url}
            isActive={isActive}
            onVideoEnd={nextSlide}
          />
        )
      }
      return <View />
    default:
      return <View />
  }
}

export default function SlideRenderer({ slide, index }: SlideProps) {
  const { nextSlide, currentSlideIndex, setSubmittableState } = useModuleStore()
  const isActive = currentSlideIndex === index;
  
  useEffect(() => {
    if (isActive && slide.type !== "Assessment") {
      setSubmittableState(currentSlideIndex, false)
    }
  }, [currentSlideIndex, setSubmittableState])

  return (
    <View style={styles.slideRenderer}>
      <SlideComponent 
        slide={slide} 
        isActive={isActive} 
        nextSlide={nextSlide} 
        index={index} 
      />
    </View>
  )
}