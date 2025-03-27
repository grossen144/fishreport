import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { LunarData } from "@fishreport/shared/types/weather";

export enum FishSpecies {
  PERCH = "perch",
  PIKE = "pike",
  ZANDER = "zander",
}

@Entity()
export class FishingReport {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.reports)
  user!: User;

  @Column()
  species!: string;

  @Column()
  date!: Date;

  @Column()
  location!: string;

  @Column()
  hours_fished!: number;

  @Column()
  number_of_persons!: number;

  @Column()
  number_of_fish!: number;

  @Column({ nullable: true })
  fish_over_40cm?: number;

  @Column({ nullable: true })
  bonus_pike?: number;

  @Column({ nullable: true })
  bonus_zander?: number;

  @Column("decimal", { precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column("decimal", { precision: 10, scale: 8, nullable: true })
  longitude?: number;

  @Column("decimal", { precision: 4, scale: 1, nullable: true })
  water_temperature?: number;

  @Column({ nullable: true })
  bag_total?: number;

  @Column({ nullable: true })
  comment?: string;

  @Column("decimal", { precision: 4, scale: 1, nullable: true })
  air_temperature?: number;

  @Column("decimal", { precision: 4, scale: 1, nullable: true })
  wind_speed?: number;

  @Column({ nullable: true })
  wind_direction?: string;

  @Column({ nullable: true })
  weather_condition?: string;

  @Column("jsonb", { nullable: true })
  lunar_phase?: LunarData;

  @Column("jsonb", { nullable: true })
  weather_data?: Record<string, any>;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
