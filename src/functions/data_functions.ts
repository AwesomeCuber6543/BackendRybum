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
        //const checkUserQuery = "SELECT 1 FROM Users WHERE BINARY username = ? LIMIT 1";
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
                                reject("Duplicate entry already exists");
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

module.exports = {
    saveData: saveData,
    updateData: updateData,
    saveImage: saveImage,
    requestFriend: requestFriend,
    getData: getData,
    getImage: getImage,
    getUsername: getUsername,
    getEmail: getEmail,
}