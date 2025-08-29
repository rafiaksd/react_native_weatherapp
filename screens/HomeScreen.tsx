 
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImages } from '../constants/index';
import { theme } from '../theme';
import * as Progress from 'react-native-progress'

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false)
  const [locations, setLocations] = useState([1,2,3])
  const [weather, setWeather] = useState({})
  const [loading, setLoading] = useState(true)  

  const handleLocation = (loc:any)=>{
    console.log('location: '+ loc)
    setLocations([])

    setLoading(true)

    fetchWeatherForecast({
      cityName:loc.name, days: '7'
    }).then(data=>{
      setWeather(data)
      setLoading(false)
      console.log('got forecast: ', data)
    })
  }

  const handleSearch = value => {
    if (value.length>2){
      fetchLocations({cityName:value}).then(data=>{
        setLocations(data);
      })
    }
  }

  useEffect(()=>{
    fetchMyWeatherData()
  }, [])

  const fetchMyWeatherData = async ()=> {
    fetchWeatherForecast({
      cityName: 'Islamabad',
      days: '7'
    }).then(data=>{
      setWeather(data)
      setLoading(false)
    })
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])

  const {current, location} = weather

  return (
    <View className='flex-1 relative'>
      <Text className="text-4xl font-[#ffccff]">HomeScreen i mean ig a changea</Text>
      <Image blurRadius={70} source={require('../assets/images/bg_dark_blue.jpg')}
      className="absolute h-full w-full" />

      {loading? (
        <View className="flex-1 flex-row justify-center items-center">
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      ):(
        <SafeAreaView className='flex flex-1'>
        {/*search section*/}
        <View style={{height:'7%'}} className='mx-4 relative z-50'>
          <View className='flex-row justify-end items-center rounded-full' style={{backgroundColor: showSearch? theme.bgWhite(0.2): 'transparent'}}>
              {
                showSearch? (
                  <TextInput onChangeText={handleTextDebounce} placeholder='Search city' placeholderTextColor={'lightgray'} className='pl-6 h-10 flex-1 text-base text-white'/>
                ):null
              }
              <TouchableOpacity
              onPress={()=> toggleSearch(!showSearch)}
              style={{backgroundColor: theme.bgWhite(0.3)}}
              className='rounded-full p-3 m-1' >
                <MagnifyingGlassIcon size="25" color="white" />
              </TouchableOpacity>
            </View>

            {
              locations.length>0 && showSearch? (
                <View className='absolute w-full bg-gray-300 top-16 rounded-3xl'>
                  {
                    locations.map((loc:any,index)=>{
                      let showBorder = index+1 !== locations.length;
                      let borderClass = showBorder? 'border-b-2 border-b-gray-700': '';
                      return(
                        <TouchableOpacity
                        onPress={()=> handleLocation(loc)}
                        key={index}
                        className={"flex-row items-center border-0 p-3 px-4 mb-1 " + borderClass}>
                          <MapPinIcon size='20' color='gray' />
                          <Text className='text-black text-lg ml-2'>{loc?.name}, {loc?.country}</Text>
                        </TouchableOpacity>
                      )
                    })
                  }
                </View>
              ): null
            } 
        </View>

        {/*forecast section*/}

        <View className='mx-4 flex justify-around flex-1 mb-2'>
          {/*location*/}
          <Text className='text-white text-center text-2xl font-bold'>
            {location?.name}, 
            <Text className='text-lg font-semibold text-gray-300'>
               {"  "+ location?.country}
            </Text>
          </Text>

          {/*weather image*/}
          <View className='flex-row justify-center'>
            <Image
              source={weatherImages[current?.condition?.text]}
              className='w-52 h-52'
            />
          </View>

          {/*degree celsius*/}
          <View className='space-y-2'>
            <Text className='text-center font-bold text-white text-6xl ml-5'>
              {current?.temp_c}&#176;
            </Text>
            <Text className='text-center font-bold text-white text-2xl ml-5'>
              {current?.condition?.text}
            </Text>
          </View>

          {/* other stats */}
            <View className='flex-row justify-between mx-4'>

              <View className='flex-row space-x-2 items-center'>
                <Image source={require('../assets/icons/wind.png')} className='h-6 w-6' />
                <Text className='text-white font-semibold text-base'>  {current?.wind_kph} km</Text>
              </View>

              <View className='flex-row space-x-2 items-center'>
                <Image source={require('../assets/icons/pm2_5_nose_icon.png')} className='h-6 w-6' />
                <Text className='text-white font-semibold text-base'> PM2.5: {current?.air_quality?.pm2_5}</Text>
              </View>

              <View className='flex-row space-x-2 items-center'>
                <Image source={require('../assets/icons/drop.png')} className='h-6 w-6' />
                <Text className='text-white font-semibold text-base'> {current?.humidity}%</Text>
              </View>

              <View className='flex-row space-x-2 items-center'>
                <Image source={require('../assets/icons/sun.png')} className='h-6 w-6' />
                <Text className='text-white font-semibold text-base'> 6:05 AM</Text>
              </View>

            </View>

        </View>

        {/*forecast for next days*/}
        <View className='mb-2 space-y-3'>
          <View className='flex-row items-center mx-5 space-x-2'>
            <CalendarDaysIcon size="22" color="white" />
            <Text className='text-white text-base'> Daily Forecast</Text>
          </View>
        <ScrollView
          horizontal
          contentContainerStyle={{paddingHorizontal: 15}}
          showsHorizontalScrollIndicator={false}
        >
          {
            weather?.forecast?.forecastday?.map((item,index)=>{
              let date = new Date(item.date)
              let options = {weekday: 'long'}
              let dayName = date.toLocaleDateString('en-US', options)
              dayName = dayName.split(',')[0]

              return(
                <View key={index} className='flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4' style={{backgroundColor: theme.bgWhite(0.15)}}>
                  <Image source={weatherImages[item?.day?.condition?.text]}
                  className='h-11 w-11'/>
                  <Text className='text-white'>{dayName}</Text>
                  <Text className='text-white text-xl font-semibold'>{item?.day?.avgtemp_c}&#176;</Text>
                </View>
              )
            })
          }

        </ScrollView>
        </View>


      </SafeAreaView>  
      )}

    </View>
  );
}