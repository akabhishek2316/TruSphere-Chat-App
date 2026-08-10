import React from "react";
import {

    FlatList,
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    Image,
    TextInput,
} from "react-native";

import { onAuthStateChanged } from "../services/authService";

import { auth } from "../services/firebase";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    subscribeUsers,
} from "../services/userService";
import {
    useEffect,
    useState,
} from "react";

import { subscribeLastMessage } from "../services/chatService";
import {
    updateSession,
} from "../services/sessionService";
import {
    AppState,
} from "react-native";

import {
    subscribeSession,
} from "../services/sessionService";

import { logout } from "../services/authService";

import { getDeviceId } from "../services/deviceService";

import { Alert } from "react-native";
import {
    deleteChat,
    clearChatForMe,
} from "../services/chatService";

import { BackHandler } from "react-native";
import { subscribePrivacy } from "../services/privacyService";
import { getChatId } from "../types/utils/chatUtils";
import { useNavigation } from "@react-navigation/native";
import { subscribePresence } from "../services/presenceService";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentUser } from "../services/authService";
import { formatChatListTime } from "../types/utils/formatTime";
import { getUserProfile } from "../services/userService";
import { subscribeUnreadCount, } from "../services/chatService";
import { subscribeLastReaction } from "../services/chatService";
import { subscribeTyping } from "../services/typingService";
import {
    subscribeHiddenChats,
} from "../services/chatService";

import { registerForPushNotifications } from "../services/notificationService";
import { saveFcmToken } from "../services/userService";



export default function ChatListScreen() {


    const navigation = useNavigation<any>();
    // const currentUser = getCurrentUser();
    const [currentUser, setCurrentUser] = useState(auth.currentUser);
    const [authReady, setAuthReady] = useState(false);





    const [chats, setChats] = useState<any[]>([]);
    const [myProfile, setMyProfile] = useState<any>(null);

    const [search, setSearch] = useState("");
    const [hiddenChats, setHiddenChats] =
        useState<Record<string, boolean>>({});
    const [selectedChat, setSelectedChat] =
        useState<any>(null);

    const selectionMode =
        selectedChat !== null;

    const [typingDots, setTypingDots] =
        React.useState(".");


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {


            setCurrentUser(user);
            setAuthReady(true);
        });

        return unsubscribe;
    }, []);


    useEffect(() => {
        if (!authReady || !currentUser) return;

        let mounted = true;

        async function initNotifications() {
            try {
                console.log("INIT NOTIFICATION");

                const token = await registerForPushNotifications();

                if (!mounted || !token) return;

                await saveFcmToken(currentUser!.uid, token);

                console.log("FCM TOKEN SAVED");
            } catch (e) {
                console.log("Notification Init Error", e);
            }
        }

        initNotifications();

        return () => {
            mounted = false;
        };
    }, [authReady, currentUser]);

    useEffect(() => {
        const backAction = () => {

            if (selectionMode) {
                setSelectedChat(null);
                return true; // Back event consume ho gaya
            }

            return false; // Normal back behavior
        };

        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => subscription.remove();

    }, [selectionMode]);

    useEffect(() => {
        const me = getCurrentUser()?.uid;

        if (!me) return;

        return subscribeHiddenChats(
            me,
            setHiddenChats
        );
    }, [currentUser]);



    useEffect(() => {
        const load = async () => {
            const me = getCurrentUser()?.uid || "";
            if (!me) return;


            const unsubscribe =
                subscribeUsers((users) => {
                    setChats(oldChats => {

                        return Object.entries(users)
                            .filter(([uid]) => uid !== me)
                            .map(([uid, user]: any) => {

                                const old =
                                    oldChats.find(
                                        c => c.otherUserId === uid
                                    );

                                return {
                                    id: getChatId(me, uid),
                                    otherUserId: uid,

                                    name: user.name,
                                    photo: user.photo,

                                    iBlocked: old?.iBlocked || false,
                                    blockedMe: old?.blockedMe || false,

                                    lastMessage: old?.lastMessage || "",
                                    lastTime: old?.lastTime || "",
                                    lastTimestamp: old?.lastTimestamp || 0,
                                    unread: old?.unread || 0,
                                    typing: old?.typing || false,
                                    recording: old?.recording || false,
                                    online: old?.online || false,
                                    lastSeen: old?.lastSeen || 0,
                                    lastStatus: old?.lastStatus || "",
                                    lastSender: old?.lastSender || "",
                                    lastMessageObj: old?.lastMessageObj || null,
                                };
                            });

                    });
                });

            return unsubscribe;
        };

        load();
    }, [currentUser]);




    useEffect(() => {
        console.log(
            "PROFILE EFFECT USER =>",
            getCurrentUser()?.uid
        );

        const loadProfile = async () => {
            const me = getCurrentUser()?.uid;



            if (!me) {
                console.log("PROFILE NOT LOADED");
                return;
            }

            const profile = await getUserProfile(me);



            setMyProfile(profile);
        };

        loadProfile();
    }, []);



    useEffect(() => {

        if (!currentUser) return;

        updateSession(currentUser.uid);

    }, [currentUser]);


    useEffect(() => {

        const subscription =
            AppState.addEventListener(
                "change",
                async (state) => {

                    if (
                        state === "active"
                    ) {

                        const user =
                            getCurrentUser();

                        if (user) {

                            await updateSession(
                                user.uid
                            );

                        }

                    }

                }
            );

        return () =>
            subscription.remove();

    }, [currentUser]);


    useEffect(() => {
        const unsubscribers = chats.map((chat) =>
            subscribeLastMessage(
                chat.id,
                currentUser!.uid,
                (message) => {
                    if (!message) {
                        setChats(old =>
                            old.map(c =>
                                c.id === chat.id
                                    ? {
                                        ...c,
                                        lastMessage: "",
                                        lastTime: "",
                                        lastMessageObj: null,
                                    }
                                    : c
                            )
                        );

                        return;
                    }

                    setChats((oldChats) =>
                        oldChats.map((c) =>
                            c.id === chat.id
                                ? {
                                    ...c,



                                    lastMessage:
                                        message.deletedForEveryone
                                            ? (
                                                message.sender === getCurrentUser()?.uid
                                                    ? "You deleted this message"
                                                    : "This message was deleted"
                                            )
                                            : message.replyTo
                                                ? `↩ ${message.replyTo.sender === currentUser?.uid
                                                    ? "You"
                                                    : message.replyTo.senderName
                                                }: ${message.type === "image"
                                                    ? "📷 Photo"
                                                    : message.type === "voice"
                                                        ? "🎤 Voice message"
                                                        : message.text
                                                }`
                                                : message.type === "image"
                                                    ? "📷 Photo"
                                                    : message.type === "voice"
                                                        ? "🎤 Voice message"
                                                        : message.text,

                                    lastTime: formatChatListTime(
                                        message.timestamp
                                    ),

                                    lastTimestamp: message.timestamp,
                                    lastStatus: message.status,
                                    lastSender: message.sender,
                                    lastMessageObj: message,
                                    // NEW
                                    lastReaction:
                                        message.reactions
                                            ? {
                                                emoji: Object.values(message.reactions)[0],
                                                count: Object.keys(message.reactions).length,
                                            }
                                            : null,
                                }
                                : c
                        )
                    );
                })
        );

        return () => {
            unsubscribers.forEach((u) => u());
        };
    }, [chats.length]);


    useEffect(() => {

        const unsubscribers = chats.map(chat =>

            subscribeLastReaction(

                chat.id,

                reaction => {

                    setChats(old =>

                        old.map(c =>

                            c.id === chat.id
                                ? {
                                    ...c,
                                    lastReaction: reaction,
                                }
                                : c

                        )

                    );

                }

            )

        );

        return () =>

            unsubscribers.forEach(u => u());

    }, [chats.length]);

    useEffect(() => {
        const unsubscribers = chats.map((chat) =>
            subscribePresence(
                chat.otherUserId,
                (presence) => {
                    console.log(
                        "PRESENCE",
                        chat.name,
                        presence.online,
                        presence.lastSeen
                    );
                    setChats((oldChats) =>
                        oldChats.map((c) =>
                            c.id === chat.id
                                ? {
                                    ...c,
                                    online: presence.online,
                                    lastSeen: presence.lastSeen,
                                }
                                : c
                        )
                    );
                }
            )
        );

        return () => {
            unsubscribers.forEach((u) => u());
        };
    }, [chats.length]);

    useEffect(() => {
        const me = getCurrentUser()?.uid;

        if (!me) return;

        const unsubscribers = chats.map((chat) =>
            subscribeUnreadCount(
                chat.id,
                me,
                (count) => {
                    setChats((old) =>
                        old.map((c) =>
                            c.id === chat.id
                                ? {
                                    ...c,
                                    unread: count,
                                }
                                : c
                        )
                    );
                }
            )
        );

        return () => {
            unsubscribers.forEach((u) => u());
        };
    }, [chats.length]);

    useEffect(() => {
        const unsubscribers = chats.map((chat) =>
            subscribeTyping(
                chat.otherUserId,
                (state) => {
                    setChats((oldChats) =>
                        oldChats.map((c) =>
                            c.id === chat.id
                                ? {
                                    ...c,
                                    typing: state.typing,
                                    recording: state.recording,
                                }
                                : c
                        )
                    );
                }
            )
        );

        return () => {
            unsubscribers.forEach((u) => u());
        };
    }, [chats.length]);


    useEffect(() => {
        const user = getCurrentUser();

        if (!user) return;

        let unsubscribe: any;

        (async () => {
            const deviceId =
                await getDeviceId();
            subscribeSession(user.uid, async (session) => {

                if (!session) {

                    await logout();

                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Login" }],
                    });

                    return;
                }

                const deviceId =
                    await getDeviceId();

                if (session.deviceId !== deviceId) {

                    await logout();

                    Alert.alert(
                        "Logged Out",
                        "Your account has been logged in on another device."
                    );

                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Login" }],
                    });
                }

            });
        }

        )();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };

    }, [currentUser]);

    useEffect(() => {
        const me = getCurrentUser()?.uid;

        if (!me) return;

        const unsubscribers = chats.map(chat =>
            subscribePrivacy(
                me,
                chat.otherUserId,
                privacy => {
                    setChats(oldChats =>
                        oldChats.map(c =>
                            c.id === chat.id
                                ? {
                                    ...c,
                                    iBlocked: privacy.iBlocked,
                                    blockedMe: privacy.blockedMe,
                                }
                                : c
                        )
                    );
                }
            )
        );

        return () => {
            unsubscribers.forEach(u => u());
        };
    }, [chats.length]);



    React.useEffect(() => {
        const interval = setInterval(() => {
            setTypingDots((old) => {
                if (old === ".") return "..";
                if (old === "..") return "...";
                return ".";
            });
        }, 400);

        return () => clearInterval(interval);
    }, []);

    // if (!authReady) {
    //     return (
    //         <SafeAreaView
    //             style={{
    //                 flex: 1,
    //                 justifyContent: "center",
    //                 alignItems: "center",
    //             }}
    //         >
    //             <ActivityIndicator
    //                 size="large"
    //                 color="#2563EB"
    //             />
    //         </SafeAreaView>
    //     );

        
    // }

    const visibleChats = [...chats]
    .filter(chat =>
        chat.lastMessageObj ||
        chat.lastMessage !== "" ||
        chat.lastTimestamp !== 0
    )
    .filter(chat =>
        !hiddenChats[chat.id]
    );

const hasChats = visibleChats.length > 0;



    return (
        <SafeAreaView style={styles.container}>





            <View style={styles.header}>

                {selectionMode ? (

                    <>
                        <TouchableOpacity
                            style={styles.settingButton}
                            onPress={() => setSelectedChat(null)}
                        >
                            <Ionicons
                                name="close"
                                size={26}
                                color="#2563EB"
                            />
                        </TouchableOpacity>

                        <Text
                            style={{
                                flex: 1,
                                marginLeft: 15,
                                fontSize: 18,
                                fontWeight: "700",
                                color: "#111827",
                            }}
                        >
                            1 selected
                        </Text>

                        <TouchableOpacity
                            style={styles.settingButton}
                            onPress={() => {

                                Alert.alert(
                                    "Delete Chat",
                                    "Remove this chat from your device?",
                                    [
                                        {
                                            text: "Cancel",
                                            style: "cancel",
                                        },
                                        {
                                            text: "Delete",
                                            style: "destructive",

                                            onPress: async () => {

                                                await clearChatForMe(
                                                    selectedChat.id,
                                                    currentUser!.uid,
                                                    selectedChat.messages || []
                                                );

                                                await deleteChat(
                                                    currentUser!.uid,
                                                    selectedChat.id
                                                );

                                                setSelectedChat(null);

                                            },
                                        },
                                    ]
                                );

                            }}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={24}
                                color="#EF4444"
                            />
                        </TouchableOpacity>
                    </>

                ) : (

                    <>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8,
                            }}
                        >
                            <Image
                                source={require("../../assets/branding/logo-horizontal.png")}
                                style={styles.logo}
                            />

                            <TouchableOpacity
                                style={styles.settingButton}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate("Settings")}
                            >
                                <Ionicons
                                    name="settings-outline"
                                    size={26}
                                    color="#2563EB"
                                />
                            </TouchableOpacity>
                        </View>
                    </>

                )}

            </View>




<View
    style={[
        styles.searchContainer,
        !hasChats && styles.disabledSearchContainer,
    ]}
>
    <Ionicons
        name="search-outline"
        size={21}
        color={hasChats ? "#64748B" : "#CBD5E1"}
    />

    <TextInput
        placeholder={
            hasChats
                ? "Search chats..."
                : "Start a New Chat to search users"
        }
        placeholderTextColor={
            hasChats ? "#94A3B8" : "#CBD5E1"
        }
        value={hasChats ? search : ""}
        onChangeText={hasChats ? setSearch : undefined}
        editable={hasChats}
        style={[
            styles.searchInput,
            !hasChats && styles.disabledSearchInput,
        ]}
        underlineColorAndroid="transparent"
        selectionColor="#2563EB"
        cursorColor="#2563EB"
    />

    {hasChats && search.length > 0 && (
        <TouchableOpacity
            onPress={() => setSearch("")}
            activeOpacity={0.7}
        >
            <Ionicons
                name="close-circle"
                size={20}
                color="#94A3B8"
            />
        </TouchableOpacity>
    )}
</View>

            <FlatList
                contentContainerStyle={styles.listContent}
                data={[...chats]

                    .filter(chat =>
                        chat.lastMessageObj ||
                        chat.lastMessage !== "" ||
                        chat.lastTimestamp !== 0
                    )

                    .filter(chat =>
                        !hiddenChats[chat.id]
                    )

                    .filter(chat =>
                        chat.name
                            .toLowerCase()
                            .includes(search.toLowerCase())
                    )

                    .sort((a, b) =>
                        (b.lastTimestamp || 0) -
                        (a.lastTimestamp || 0)
                    )
                }
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.72}
                        style={[
                            styles.chat,
                            selectionMode &&
                            selectedChat?.id === item.id && {
                                backgroundColor: "#E8F1FF",
                            },
                        ]}
                        onPress={() => {

                            if (selectionMode) {

                                if (
                                    selectedChat?.id === item.id
                                ) {
                                    setSelectedChat(null);
                                } else {
                                    setSelectedChat(item);
                                }

                                return;
                            }

                            navigation.navigate("Chat", {
                                chatId: item.id,
                                otherUserId: item.otherUserId,
                            });

                        }}

                        onLongPress={() => {

                            setSelectedChat(item);

                        }}
                    >
                        {item.iBlocked || item.blockedMe ? (

                            <View style={styles.avatar}>
                                <Ionicons
                                    name="person"
                                    size={26}
                                    color="#FFF"
                                />
                            </View>

                        ) : item.photo ? (

                            <Image
                                source={{ uri: item.photo }}
                                style={styles.avatar}
                            />

                        ) : (

                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {item.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>

                        )}
                        {!item.iBlocked &&
                            !item.blockedMe &&
                            item.online && (
                                <View style={styles.onlineDot} />
                            )}

                        <View style={styles.chatContent}>
                            <View style={styles.topRow}>
                                <Text style={styles.name}>
                                    {item.name}
                                </Text>

                                <Text
                                    style={[
                                        styles.time,
                                        item.unread > 0 && {
                                            color: "#2563EB",
                                            fontWeight: "700",
                                        },
                                    ]}
                                >
                                    {item.lastTime}
                                </Text>
                            </View>
                            <View style={styles.bottomRow}>

                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        flex: 1,
                                        marginRight: 8,
                                    }}
                                >

                                    {
                                        item.lastMessageObj?.sender === getCurrentUser()?.uid &&
                                        !item.lastMessageObj?.deletedForEveryone &&
                                        !item.typing &&
                                        !item.recording && (
                                            <>
                                                {item.lastMessageObj.status === "sending" && (
                                                    <Ionicons
                                                        name="time-outline"
                                                        size={14}
                                                        color="#94A3B8"
                                                        style={{ marginRight: 4 }}
                                                    />
                                                )}

                                                {item.lastMessageObj.status === "sent" && (
                                                    <Ionicons
                                                        name="checkmark"
                                                        size={15}
                                                        color="#94A3B8"
                                                        style={{ marginRight: 4 }}
                                                    />
                                                )}

                                                {item.lastMessageObj.status === "delivered" && (
                                                    <Ionicons
                                                        name="checkmark-done"
                                                        size={15}
                                                        color="#94A3B8"
                                                        style={{ marginRight: 4 }}
                                                    />
                                                )}

                                                {item.lastMessageObj.status === "read" && (
                                                    <Ionicons
                                                        name="checkmark-done"
                                                        size={15}
                                                        color="#3B82F6"
                                                        style={{ marginRight: 4 }}
                                                    />
                                                )}

                                                {item.lastMessageObj.status === "failed" && (
                                                    <Ionicons
                                                        name="alert-circle"
                                                        size={15}
                                                        color="#EF4444"
                                                        style={{ marginRight: 4 }}
                                                    />
                                                )}
                                            </>
                                        )
                                    }

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            flex: 1,
                                        }}
                                    >
                                        {!item.typing && item.lastMessageObj?.deletedForEveryone && (
                                            <Ionicons
                                                name="ban-outline"
                                                size={14}
                                                color="#7C8798"
                                                style={{ marginRight: 4 }}
                                            />
                                        )}

                                        {item.recording ? (
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    flex: 1,
                                                }}
                                            >
                                                <Ionicons
                                                    name="mic"
                                                    size={13}
                                                    color="#EF4444"
                                                    style={{ marginRight: 4 }}
                                                />

                                                <Text
                                                    style={{
                                                        color: "#EF4444",
                                                        fontStyle: "italic",
                                                        fontSize: 13,
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    Recording audio...
                                                </Text>
                                            </View>
                                        ) : item.typing ? (

                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    flex: 1,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: "#22C55E",
                                                        fontStyle: "italic",
                                                        fontSize: 13,
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    Typing{typingDots}
                                                </Text>
                                            </View>
                                        ) : (
                                            <Text
                                                numberOfLines={1}
                                                style={[
                                                    styles.message,

                                                    item.lastMessageObj?.deletedForEveryone &&
                                                    styles.deletedMessage,

                                                    item.unread > 0 &&
                                                    !item.lastMessageObj?.deletedForEveryone && {
                                                        fontWeight: "700",
                                                        color: "#111827",
                                                    },

                                                    { flex: 1 },
                                                ]}



                                            >
                                                {
                                                    item.lastReaction
                                                        ? `${item.lastReaction.emoji} Reacted to ${item.lastReaction.messageType === "image"
                                                            ? "📷 Photo"
                                                            : item.lastReaction.messageType === "voice"
                                                                ? "🎤 Voice message"
                                                                : `"${item.lastReaction.messageText}"`
                                                        }`
                                                        : item.lastMessageObj
                                                            ? item.lastMessage
                                                            : "No messages yet"
                                                }
                                            </Text>
                                        )}
                                    </View>

                                </View>

                                {
                                    item.unread > 0 && (
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>
                                                {item.unread}
                                            </Text>
                                        </View>
                                    )
                                }

                            </View>
                        </View>
                    </TouchableOpacity>



                )}




            ListEmptyComponent={
    search.length > 0 ? (
        <View style={styles.noResult}>
            <Ionicons
                name="search"
                size={55}
                color="#CBD5E1"
            />

            <Text style={styles.noResultTitle}>
                No chats found
            </Text>

            <Text style={styles.noResultText}>
                Try another name
            </Text>
        </View>
    ) : (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="chatbubbles-outline"
                size={70}
                color="#CBD5E1"
            />

            <Text style={styles.emptyTitle}>
                No Chats Yet
            </Text>

            <Text style={styles.emptySubtitle}>
                Start a new conversation
            </Text>

            <Text style={styles.emptyHint}>
                Tap the New Chat button below to find a user
                and start chatting.
            </Text>

            <TouchableOpacity
                style={styles.emptyNewChatButton}
                activeOpacity={0.8}
                onPress={() =>
                    navigation.navigate("NewChat")
                }
            >
                <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={16}
                    color="#FFFFFF"
                />

                <Text style={styles.emptyNewChatText}>
                    New Chat
                </Text>
            </TouchableOpacity>
        </View>
    )
}



            />


           {hasChats && (
    <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fab}
        onPress={() => navigation.navigate("NewChat")}
    >
        <Ionicons
            name="chatbubble-ellipses"
            size={27}
            color="#fff"
        />
    </TouchableOpacity>
)}


        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",

    },

    disabledSearchContainer: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
    elevation: 0,
    shadowOpacity: 0,
},

disabledSearchInput: {
    color: "#CBD5E1",
},


    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#F8FAFC",
    },

    logo: {
        width: 160,
        height: 50,
        resizeMode: "contain",
    },

    settingButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EFF6FF",
    },








    deletedMessage: {
        fontStyle: "italic",

        color: "#94A3B8",
    },









    listContent: {
        paddingBottom: 90,
    },

    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        marginHorizontal: 14,
        marginBottom: 10,
        height: 46,
        paddingHorizontal: 14,
        borderRadius: 14,

        borderWidth: 1,
        borderColor: "#E5E7EB",


        elevation: 1,

        shadowColor: "#000",

        shadowOpacity: 0.04,

        shadowRadius: 6,

        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    noResult: {
        alignItems: "center",

        marginTop: 80,

        paddingHorizontal: 40,
    },

    noResultTitle: {
        marginTop: 18,

        fontSize: 20,

        fontWeight: "700",

        color: "#334155",
    },

    noResultText: {
        marginTop: 6,

        fontSize: 15,

        color: "#94A3B8",
    },

    searchInput: {
        flex: 1,

        marginLeft: 10,

        fontSize: 15,

        color: "#111827",

        paddingVertical: 0,
    },
emptyContainer: {
    alignItems: "center",

    marginTop: 90,

    paddingHorizontal: 35,
},

    emptyIconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,

    backgroundColor: "#EFF6FF",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 4,
},

emptyNewChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 22,

    paddingHorizontal: 22,
    height: 48,

    borderRadius: 24,

    backgroundColor: "#2563EB",

    elevation: 4,

    shadowColor: "#2563EB",
    shadowOpacity: 0.20,
    shadowRadius: 8,
    shadowOffset: {
        width: 0,
        height: 4,
    },
},

emptyNewChatText: {
    marginLeft: 8,

    color: "#FFFFFF",

    fontSize: 15,
    fontWeight: "700",
},

emptyHint: {
    marginTop: 8,

    fontSize: 13,
    lineHeight: 19,

    color: "#94A3B8",

    textAlign: "center",

    maxWidth: 280,
},

    emptyTitle: {
        fontSize: 22,

        fontWeight: "700",

        marginTop: 18,

        color: "#334155",
    },

    emptySubtitle: {
        marginTop: 6,

        fontSize: 15,

        color: "#94A3B8",

        textAlign: "center",
    },

    chat: {
        flexDirection: "row",
        alignItems: "center",

        marginHorizontal: 10,
        marginVertical: 2,

        paddingHorizontal: 12,
        paddingVertical: 10,

        backgroundColor: "#fff",

        borderRadius: 14,

        borderBottomWidth: 0.5,
        borderBottomColor: "#EEF2F7",
    },

    avatar: {

        width: 50,
        height: 50,
        borderRadius: 25,

        backgroundColor: "#2563EB",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 12,

        overflow: "hidden",


        elevation: 2,

        borderWidth: 2,

        borderColor: "#FFFFFF",




    },

    myAvatar: {
        width: 42,

        height: 42,

        borderRadius: 21,

        backgroundColor: "#2563EB",

        justifyContent: "center",

        alignItems: "center",

        overflow: "hidden",

        borderWidth: 2,

        borderColor: "#FFFFFF",

        elevation: 2,
    },

    myAvatarText: {
        color: "#FFFFFF",

        fontSize: 18,

        fontWeight: "700",
    },

    avatarText: {

        fontSize: 20,
        fontWeight: "700",
        color: "#fff",

    },
    name: {

        fontSize: 16,
        fontWeight: "700",
        color: "#111827",

    },

    message: {
        fontSize: 13,

        color: "#6B7280",

        marginTop: 2,

        flexShrink: 1,

    },
    onlineDot: {
        position: "absolute",
        left: 46,
        bottom: 10,

        width: 12,
        height: 12,

        borderRadius: 6,

        backgroundColor: "#22C55E",

        borderWidth: 2,
        borderColor: "#fff",

    },

    time: {
        fontSize: 11,
        color: "#94A3B8",


        fontWeight: "500",
    },

    badge: {

        minWidth: 20,
        height: 20,

        borderRadius: 10,

        backgroundColor: "#2563EB",

        justifyContent: "center",
        alignItems: "center",

        paddingHorizontal: 5,

    },

    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },

    fab: {

        position: "absolute",

        right: 18,
        bottom: 22,

        width: 56,
        height: 56,

        borderRadius: 28,

        backgroundColor: "#2563EB",

        justifyContent: "center",
        alignItems: "center",

        elevation: 6,

        marginBottom: 50,


        shadowColor: "#000",

        shadowOpacity: 0.18,

        shadowRadius: 8,

        shadowOffset: {
            width: 0,
            height: 4,
        },
    },

    chatContent: {
        flex: 1,
    },

    topRow: {
        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "center",
    },

    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        marginTop: 2,

    },






    menuAvatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },

    menuAvatarText: {
        fontSize: 28,
        fontWeight: "700",
        color: "#fff",
    },

    menuName: {
        marginTop: 12,
        fontSize: 19,
        fontWeight: "700",
        color: "#111827",
    },

    menuAbout: {
        marginTop: 5,
        fontSize: 13,
        color: "#64748B",
        textAlign: "center",
        paddingHorizontal: 10,
    },


    brandContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },

    brandText: {
        marginLeft: 12,
    },

    brandTitle: {
        fontSize: 31,
        fontWeight: "800",
        color: "#0F172A",
    },

    taglineRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },

    line: {
        width: 24,
        height: 1,
        backgroundColor: "#CBD5E1",
        marginHorizontal: 6,
    },

    tagline: {
        fontSize: 11,
        color: "#2563EB",
        marginHorizontal: 4,
        fontWeight: "600",
    },

    headerSubtitle: {
        marginTop: 6,
        fontSize: 13,
        color: "#64748B",
    },


});