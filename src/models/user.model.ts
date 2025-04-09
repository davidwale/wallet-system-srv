import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table
export class User extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare fullName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true, 
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare googleId: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isUserVerified: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare verifyOtp: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare resetOtp: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare verifyOtpExpiry: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare resetOtpExpiry: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare googleTokens: object;
}