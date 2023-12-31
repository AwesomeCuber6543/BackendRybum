const connection = require('../helpers/mysql_pools');
import { MysqlError, OkPacket} from "mysql";

const saveData = async function saveData(email: string, data: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {
        const query = "INSERT INTO Data SET ?"

        const insertData = {
            email: email,
            data: data
        }

        connection.query(query, insertData, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null) {
                if (result.affectedRows == 1) {
                    resolve(null); return;
                } else {
                    reject('Unknown error 1 saving data to database.'); return
                }
            } else {
                reject('Unknown error 2 saving data to database.'); return
            }
        });
    }));
};

const updateData = async function updateData(email: string, data: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {

        const query = "UPDATE Data SET ? WHERE email=" + connection.escape(email);


        const insertData = {
            email: email,
            data: data
        }

        connection.query(query, insertData, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null) {
                resolve(null); return;
            } else {
                reject('Unknown error 2 saving data to database.'); return
            }
        });
    }));
};


const saveImage = async function saveImage(email: string, profilepic: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {
        const query = "INSERT INTO ProfilePics SET ?"

        const insertImage = {
            email: email,
            profilepic: profilepic
        }

        connection.query(query, insertImage, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null) {
                if (result.affectedRows == 1) {
                    resolve(null); return;
                } else {
                    reject('Unknown error 1 saving image to database.'); return
                }
            } else {
                reject('Unknown error 2 saving image to database.'); return
            }
        });
    }));
};


const requestFriend = async function requestFriend(email: string, friendsusername: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {
        const checkUserQuery = "SELECT 1 FROM Users WHERE BINARY username = ? AND email <> ? LIMIT 1"
        const checkFriendQuery = "SELECT 1 FROM FriendsList WHERE email = ? AND BINARY friendsusername = ? AND value = 1 LIMIT 1";
        const insertFriendQuery = "INSERT IGNORE INTO FriendsList SET ?";
        const checkIfUserIsSameQuery = "SELECT * FROM Users WHERE BINARY username = ? AND email = ? LIMIT 1";

        connection.query(checkUserQuery, [friendsusername, email], (err: MysqlError | null, userResult: any) => {
            if (err != null) {
                reject(err.message);
                return;
            }

            if (userResult.length === 0) {
                reject("The username does not exist");
                return;
            }

            connection.query(checkIfUserIsSameQuery, [friendsusername, email], (err: MysqlError | null, checkSameAcc: any) => {
                if (err != null) {
                    reject(err.message);
                    return;
                }

                if(checkSameAcc.length > 0) {
                    reject("You can't send a friend request to yourself"); return;
                }

                connection.query(checkFriendQuery, [email, friendsusername], (err: MysqlError | null, friendResult: any) => {
                    if (err != null) {
                        reject(err.message);
                        return;
                    }

                    if (friendResult.length > 0) {
                        reject("You are already friends with this user");
                        return;
                    }

                    const insertFriendRequest = {
                        email: email,
                        friendsusername: friendsusername,
                        value: 0,
                    };

                    connection.query(insertFriendQuery, insertFriendRequest, (err: MysqlError | null, result: OkPacket | null) => {
                        if (err != null) {
                            reject(err.message);
                            return;
                        }

                        if (result != null) {
                            if (result.affectedRows === 1 || result.warningCount === 0) {
                                resolve(null);
                                return;
                            } else {
                                reject("Already sent a friend request");
                                return;
                            }
                        } else {
                            reject("Unknown error saving friend request to database.");
                            return;
                        }
                    });
                });
            });
        });
    }));
};

const acceptFriend = async function acceptFriend(email: string, friendsUsername: string): Promise<null> {
    return new Promise<null>((resolve, reject) => {
        const updateQuery = `
      UPDATE FriendsList
      SET value = 1
      WHERE email = (
        SELECT email
        FROM Users
        WHERE username = ?
      ) AND friendsusername = (
        SELECT username
        FROM Users
        WHERE email = ?
      );
    `;

        const insertQuery = `INSERT INTO FriendsList (email, friendsusername, value) VALUES (?, ?, 1)`;

        connection.query(updateQuery, [friendsUsername, email], (err: MysqlError | null, result: any) => {
            if (err) {
                reject(err.message);
                return;
            }

            if (result.affectedRows === 0) {
                reject("No friend request found matching the provided information.");
                return;
            }

            connection.query(insertQuery, [email, friendsUsername], (err: MysqlError | null, result: any) => {
                if (err) {
                    reject(err.message); return;
                }

                if (result.affectedRows == 1) {
                    resolve(null); return;
                }
                else {
                    reject('unknown error accepting friend request'); return;
                }
            });
        });
    });
};




const getFriendRequests = async function getFriendRequests(username: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        const query = `
      SELECT u.username
      FROM Users u
      JOIN FriendsList f ON u.email = f.email
      WHERE f.friendsusername = ? AND f.value = 0;
    `;

        connection.query(query, [username], (err: MysqlError | null, results: any) => {
            if (err) {
                reject(err.message);
                return;
            }

            const usernames = results.map((row: any) => row.username);
            resolve(usernames);
        });
    });
};


const getFriends = async function getFriends(email: string): Promise<string[]> {
    return new Promise<string[]>(((resolve, reject) => {
        const query = `SELECT friendsusername FROM FriendsList where value=1 and email=` + connection.escape(email)

        connection.query(query, (err: MysqlError | null, results: any[]) => {
            if (err != null) {
                reject(err.message); return;
            }

            const friendsArray: string[] = []

            for (let result of results) {
                if (result?.friendsusername) {
                    friendsArray.push(result.friendsusername)
                }
            }

            resolve(friendsArray); return;
        });

    }));
}

const deleteFriend = async function deleteFriend(email: string, friendUsername: string, friendEmail: string, loggedUsername: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {

        const deleteQuery = `DELETE FROM FriendsList WHERE email=? AND friendsusername=? AND value=1`;

        connection.query(deleteQuery, [email, friendUsername], (err: MysqlError | null, result: any) => {
            if (err) {
                reject(err.message);
                return;
            }

            if(result.affectedRows !== 1) {
                reject("You are not friends with the user"); return;
            }

            connection.query(deleteQuery, [friendEmail, loggedUsername], (err: MysqlError | null, result: any) => {
                if (err) {
                    reject(err.message); return;
                }

                if(result.affectedRows !== 1) {
                    reject("You are not friends with the user"); return;
                }

                resolve(null); return;

            });
        });
    }));
};



const getData = async function getData(email: string): Promise<string[]> {
    return new Promise<string[]>(((resolve, reject) => {
        const query = "SELECT * FROM Data WHERE email=" + connection.escape(email);

        connection.query(query, (err: MysqlError | null, results: any[]) => {
            if (err != null) {
                reject(err.message); return;
            }

            const dataArray: string[] = []

            for (let result of results) {
                if (result?.data) {
                    dataArray.push(result.data)
                }
            }

            resolve(dataArray); return;
        });
    }));
};

const getImage = async function getImage(email: string): Promise<string[]> {
    return new Promise<string[]>(((resolve, reject) => {
        const query = "SELECT * FROM ProfilePics WHERE email=" + connection.escape(email);

        connection.query(query, (err: MysqlError | null, results: any[]) => {
            if (err != null) {
                reject(err.message); return;
            }

            const imageArray: string[] = []

            for (let result of results) {
                if (result?.profilepic) {
                    imageArray.push(result.profilepic)
                }
            }

            resolve(imageArray); return;
        });
    }));
};

const getUsername = async function getUsername(email: string): Promise<string[]> {
    return new Promise<string[]>(((resolve, reject) => {
        const query = "SELECT username FROM Users WHERE email=" + connection.escape(email);

        connection.query(query, (err: MysqlError | null, results: any[]) => {
            if (err != null) {
                reject(err.message); return;
            }

            const username: string[] = []

            for (let result of results) {
                if (result?.username) {
                    username.push(result.username)
                }
            }

            resolve(username); return;
        });
    }));
};

const getUsernameFromEmail = async function getUsernameFromEmail(email: string): Promise<string[]> {
    return new Promise<string[]>(((resolve, reject) => {
        const query = "SELECT username FROM Users WHERE email=" + connection.escape(email);

        connection.query(query, (err: MysqlError | null, results: any[]) => {
            if (err != null) {
                reject(err.message); return;
            }

            const username: string[] = []

            for (let result of results) {
                if (result?.username) {
                    username.push(result.username)
                }
            }

            resolve(username); return;
        });
    }));
};

const getEmailFromUsername = async function getEmailFromUsername(username1: string): Promise<string[]> {
    return new Promise<string[]>(((resolve, reject) => {
        const query = `SELECT email FROM Users WHERE username=?`;

        connection.query(query, username1,(err: MysqlError | null, results: any[]) => {
            if (err != null) {
                reject(err.message); return;
            }

            const usernameToSubmit: string[] = []

            for (let result of results) {
                if (result?.email) {
                    usernameToSubmit.push(result.email)
                }
            }
            resolve(usernameToSubmit); return;
        });
    }));
};

const getEmail = async function getEmail(email: string): Promise<string[]> {
    return new Promise<string[]>(((resolve, reject) => {
        const query = "SELECT email FROM Users WHERE email=" + connection.escape(email);

        connection.query(query, (err: MysqlError | null, results: any[]) => {
            if (err != null) {
                reject(err.message); return;
            }

            const returnedEmail: string[] = []

            for (let result of results) {
                if (result?.email) {
                    returnedEmail.push(result.email)
                }
            }

            resolve(returnedEmail); return;
        });
    }));
};

const resetURLs = async function resetURLs(randoUrl: String): Promise<null> {
    return new Promise<null>(((resolve, reject) => {
        const query = "UPDATE DailySongsUrl SET url=" + randoUrl;

        connection.query(query, (err: MysqlError | null, results: any) => {
            if (err != null) {
                reject(err.message); return;
            }
            resolve(null); return;
        });
    }));
};

const resetDailyPics = async function resetDailyPics(defaultPic: String): Promise<null> {
    return new Promise<null>(((resolve, reject) => {
        const query = "UPDATE DailyPictures SET url=" + defaultPic;

        connection.query(query, (err: MysqlError | null, results: any) => {
            if (err != null) {
                reject(err.message); return;
            }
            resolve(null); return;
        });
    }));
};

const saveAccessToken = async function saveAccessToken(email: string, accessToken: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {
        const query = "INSERT INTO AccessTokens SET ?"

        const insertImage = {
            email: email,
            accesstoken: accessToken
        }

        connection.query(query, insertImage, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null) {
                if (result.affectedRows == 1) {
                    resolve(null); return;
                } else {
                    reject('Unknown error 1 saving access token to database.'); return
                }
            } else {
                reject('Unknown error 2 saving access token to database.'); return
            }
        });
    }));
};

const saveRefreshToken = async function saveRefreshToken(email: string, refreshToken: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {
        const query = "INSERT INTO RefreshTokens SET ?"

        const insertImage = {
            email: email,
            refreshtoken: refreshToken
        }

        connection.query(query, insertImage, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null) {
                if (result.affectedRows == 1) {
                    resolve(null); return;
                } else {
                    reject('Unknown error 1 saving refresh token to database.'); return
                }
            } else {
                reject('Unknown error 2 saving refresh token to database.'); return
            }
        });
    }));
};

const updateAccessToken = async function updateAccessToken(email: string, accessToken: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {

        const query = "UPDATE AccessTokens SET ? WHERE email=" + connection.escape(email);


        const insertData = {
            email: email,
            accesstoken: accessToken
        }

        connection.query(query, insertData, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null) {
                resolve(null); return;
            } else {
                reject('Unknown error 2 saving access token to database.'); return
            }
        });
    }));
};

const updateRefreshToken = async function updateRefreshToken(email: string, refreshToken: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {

        const query = "UPDATE RefreshTokens SET ? WHERE email=" + connection.escape(email);


        const insertData = {
            email: email,
            refreshtoken: refreshToken
        }

        connection.query(query, insertData, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null) {
                resolve(null); return;
            } else {
                reject('Unknown error 2 saving refresh token to database.'); return
            }
        });
    }));
};

const deleteRefreshToken = async function deleteRefreshToken(email: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {

        const query = "DELETE FROM RefreshTokens WHERE email=" + connection.escape(email);


        connection.query(query, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if(result?.affectedRows === 0) {
                reject("You are not currently signed into spotify"); return;
            }

            if (result != null) {
                resolve(null); return;
            } else {
                reject('Unknown error deleting refresh token'); return
            }
        });
    }));
};

const deleteAccessToken = async function deleteAccessToken(email: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {

        const query = "DELETE FROM AccessTokens WHERE email=" + connection.escape(email);

        connection.query(query, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if(result?.affectedRows === 0) {
                reject("You are not currently signed into spotify"); return;
            }

            if (result != null) {
                resolve(null); return;
            } else {
                reject('Unknown error deleting access token'); return
            }
        });
    }));
};

const saveUrl = async function saveUrl(email: string, url: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {
        const query = "INSERT INTO DailySongsUrl SET ?"

        const insertURL = {
            email: email,
            url: url
        }

        connection.query(query, insertURL, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null) {
                if (result.affectedRows == 1) {
                    resolve(null); return;
                } else {
                    reject('Unknown error 1 saving url to database.'); return
                }
            } else {
                reject('Unknown error 2 saving url to database.'); return
            }
        });
    }));
};

const saveDailyImage = async function saveDailyImage(email: string, dailyPic: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {
        const query = "INSERT INTO DailyPictures SET ?"

        const insertImage = {
            email: email,
            dailyPic: dailyPic
        }

        connection.query(query, insertImage, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null) {
                if (result.affectedRows == 1) {
                    resolve(null); return;
                } else {
                    reject('Unknown error 1 saving daily image to database.'); return
                }
            } else {
                reject('Unknown error 2 saving daily image to database.'); return
            }
        });
    }));
};

const getAccessToken = async function getAccessToken(email: string): Promise<string[]> {
    return new Promise<string[]>(((resolve, reject) => {
        const query = "SELECT * FROM AccessTokens WHERE email=" + connection.escape(email);

        connection.query(query, (err: MysqlError | null, results: any[]) => {
            if (err != null) {
                reject(err.message); return;
            }

            const accessTokenArray: string[] = []

            for (let result of results) {
                if (result?.accessToken) {
                    accessTokenArray.push(result.accessToken)
                }
            }

            resolve(accessTokenArray); return;
        });
    }));
};

const getRefreshToken = async function getRefreshToken(email: string): Promise<string[]> {
    return new Promise<string[]>(((resolve, reject) => {
        const query = "SELECT * FROM RefreshTokens WHERE email=" + connection.escape(email);

        connection.query(query, (err: MysqlError | null, results: any[]) => {
            if (err != null) {
                reject(err.message); return;
            }

            const refreshTokenArray: string[] = []

            for (let result of results) {
                if (result?.refreshToken) {
                    refreshTokenArray.push(result.refreshToken)
                }
            }

            resolve(refreshTokenArray); return;
        });
    }));
};


module.exports = {
    saveData: saveData,
    updateData: updateData,
    saveImage: saveImage,
    acceptFriend: acceptFriend,
    getFriendRequests: getFriendRequests,
    getFriends: getFriends,
    requestFriend: requestFriend,
    deleteFriend: deleteFriend,
    getData: getData,
    getImage: getImage,
    getUsername: getUsername,
    getUsernameFromEmail: getUsernameFromEmail,
    getEmailFromUsername: getEmailFromUsername,
    getEmail: getEmail,
    resetURLs: resetURLs,
    resetDailyPics: resetDailyPics,
    saveAccessToken: saveAccessToken,
    saveRefreshToken: saveRefreshToken,
    updateAccessToken: updateAccessToken,
    updateRefreshToken: updateRefreshToken,
    deleteRefreshToken: deleteRefreshToken,
    deleteAccessToken: deleteAccessToken,
    saveUrl: saveUrl,
    saveDailyImage: saveDailyImage,
    getAccessToken: getAccessToken,
    getRefreshToken: getRefreshToken,

}