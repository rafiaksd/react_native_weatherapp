import { StatusBar } from 'react-native';
import "./global.css";
import AppNavigation from "./navigation/appNavigation";

export default function App(){
     return (
          <>
          <StatusBar hidden={true} />
          <AppNavigation />
          </>
     )
}