import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import React, { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 50px;
  }
`;
const AvatarImage = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 22px;
  display: flex;
  gap: 10px;
`;
const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`;
const EditNameButton = styled.span`
  width: 30px;
  height: 30px;
  background-color: black;
  color: white;
  border: 0;
  cursor: pointer;
  svg {
  }
`;
const EditNameInput = styled.input`
  border: 2px solid #1d90f0;
  border-radius: 20px;
  width: 100%;
  font-size: 22px;
  text-align: center;
  background-color: black;
  color: white;
`;

export default function Profile() {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [isNameEditting, setNameEditting] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!user) return;
    if (files && files.length === 1) {
      const file = files[0];
      const locationRef = ref(storage, `avatar/${user.uid}`);
      const result = await uploadBytes(locationRef, file);
      const avatarURL = await getDownloadURL(result.ref);
      setAvatar(avatarURL);
      await updateProfile(user, {
        photoURL: avatarURL,
      });
    }
  };

  const onClickNameChange = () => {
    setNameEditting(!isNameEditting);
  };
  const onNewNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };
  const submitNewName = async () => {
    if (!user || newName === user.displayName) return;
    await updateProfile(user, {
      displayName: newName,
    });
    setNameEditting(false);
  };
  useEffect(() => {
    const fetchTweets = async () => {
      const tweetQuery = query(collection(db, "tweets"), where("userID", "==", user?.uid), orderBy("createdAt", "desc"), limit(25));
      const snapshot = await getDocs(tweetQuery);
      const tweets = snapshot.docs.map((doc) => {
        const { tweet, createdAt, userID, username, photo } = doc.data();
        return { tweet, createdAt, userID, username, photo, ID: doc.id };
      });
      setTweets(tweets);
    };
    fetchTweets();
  }, [user?.uid]);
  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {avatar ? (
          <AvatarImage src={avatar} />
        ) : (
          <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
          </svg>
        )}
      </AvatarUpload>
      <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="umage/*" />
      {isNameEditting ? (
        <Name>
          <EditNameInput onChange={onNewNameChange} value={newName} name="newName" placeholder="Input new name" type="text" />
          <EditNameButton onClick={submitNewName}>
            <svg fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </EditNameButton>
        </Name>
      ) : (
        <Name>
          {user?.displayName ?? "Annonymous"}
          <EditNameButton onClick={onClickNameChange}>
            <svg fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </EditNameButton>
        </Name>
      )}
      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.ID} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
