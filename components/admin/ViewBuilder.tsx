import AIAssessmentGenerator from './AIAssessmentGenerator';

function ViewBuilder() {
  // Function to handle newly created assessments
  const handleAssessmentsCreated = (newAssessments: AssessmentInfo[]) => {
    // You might want to refresh your view data or show a success message
    console.log(`Created ${newAssessments.length} new assessments`);
    
    // Update your state or fetch the latest data
    // fetchViewData(); or similar
  };
  
  return (
    <View>
      <AIAssessmentGenerator 
        viewId={currentViewId} 
        onAssessmentsCreated={handleAssessmentsCreated} 
      />
    </View>
  );
}

export default ViewBuilder; 