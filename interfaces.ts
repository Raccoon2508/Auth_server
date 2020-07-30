export interface SingleEvent {
    id: number;
    userId: number;
    year: number;
    month: number;
    day: number;
    timeFrom: string;
    timeTo: string;
    title: string;
    comment: string;
    priority: string;
}

export interface UserEventNode {
    userID: number;
    eventID: number;
}

export interface User {
    name: string;
    id: number;
    email: string;
    pass: string;
}

export interface FullEventsBase {
    users: User[];
    usersEvents: UserEventNode[];
    events: SingleEvent[];
}
