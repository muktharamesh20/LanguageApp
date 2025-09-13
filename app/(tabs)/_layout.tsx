import { icons } from '@/constants/icons'
import { Tabs } from 'expo-router'
import React from 'react'
import { Image, View } from 'react-native'

const TabIcon = ({ focused, icon, title }: any) => {
    if (focused) {
        return <View className="size-full justify-center mt-4 items-center rounded-full">
            <Image
                source={icon}
                tintColor='#000000' className="size-6"
            />
            {/* <Text className = "text-secondary text-base font-semibold ml-2"> {title} </Text> */}
        </View>
    }
    return <View className="size-full justify-center mt-4 items-center rounded-full">
        <Image
            source={icon}
            tintColor="#9A9A9A" className="size-6"
        />
        {/* <Text className = "text-secondary text-base font-semibold ml-2"> {title} </Text> */}
    </View>
}

const _layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: { //individual options
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center'
                },
                tabBarStyle: { //the tabs themselves
                    backgroundColor: '#F9F8F5',
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    bottom: 0,
                    overflow: 'hidden',
                    borderTopWidth: 1.5,
                    borderColor: '#E4E4E4',
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.home}
                            title="Home"
                        />
                    )
                }} />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: 'Calendar',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.calendar}
                            title="Calendar"
                        />
                    ),

                }} />
            <Tabs.Screen
                name="kanban"
                options={{
                    title: 'kanban',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.kanban}
                            title="kanban"
                        />
                    )
                }} />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'message',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.message}
                            title="message"
                        />
                    )
                }} />
            <Tabs.Screen
                name="myProfile"
                options={{
                    title: 'myProfile',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.person}
                            title="myProfile"
                        />
                    )
                }} />
        </Tabs>
    )
}

export default _layout
