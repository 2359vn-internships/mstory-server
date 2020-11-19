import { type } from "os";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { ulid } from 'ulid';
import Project from "./Project";

@Entity({ name: "users" })
export default class User {
    @PrimaryColumn({ type: "char", length: 26 })
    user_id: string;

    @Column({ type: "varchar", length: 64, unique: true })
    email: string;

    @Column({ type: "varchar", length: 50 })
    fullname: string;

    @Column({ type: "varchar", length: 39, unique: true })
    username: string;

    @Column({ type: "varchar", length: 1024, nullable: true, select: false })
    password: string;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    last_login: Date

    // Projects created by this user...
    @OneToMany(type => Project, project => project.creator)
    projects_created: Promise<Project[]>

    @BeforeInsert()
    private beforeInsert() {
        this.user_id = ulid()
        this.email = this.email.toLowerCase()
        this.username = this.username.toLowerCase()
    }

    @BeforeUpdate()
    private lowerCaseEmail() {
        this.email = this.email.toLowerCase()
    }
}
