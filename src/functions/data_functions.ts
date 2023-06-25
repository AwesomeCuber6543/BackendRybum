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
    saveImage: saveImage,
    getData: getData,
    getImage: getImage,
    getUsername: getUsername,
    getEmail: getEmail,
}