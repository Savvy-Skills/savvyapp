'use dom'
import { Unity, useUnityContext } from "react-unity-webgl";


function SavvyAgentGame() {
  const { unityProvider } = useUnityContext({
    loaderUrl: ("unity/SavvyAgent.loader.js"),
    dataUrl: ("unity/SavvyAgent.data"),
    frameworkUrl: ("unity/SavvyAgent.framework.js"),
    codeUrl: ("unity/SavvyAgent.wasm"),
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Unity unityProvider={unityProvider} style={{ width: '640px', height: '480px'}} />
    </div>
  );
  ;
}

export default SavvyAgentGame;
