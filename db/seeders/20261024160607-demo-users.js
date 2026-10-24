'use strict';

const DEMO_USERS = [
  {
    email: 'host@raceup.test',
    school_id: '209900000001',
    full_name: 'Demo Host',
    nickname: 'DemoHost',
    role: 'host',
  },
  {
    email: 'aster@raceup.test',
    school_id: '209900000002',
    full_name: 'Demo Aster',
    nickname: 'Aster',
    role: 'player',
  },
  {
    email: 'basil@raceup.test',
    school_id: '209900000003',
    full_name: 'Demo Basil',
    nickname: 'Basil',
    role: 'player',
  },
  {
    email: 'cora@raceup.test',
    school_id: '209900000004',
    full_name: 'Demo Cora',
    nickname: 'Cora',
    role: 'player',
  },
  {
    email: 'dune@raceup.test',
    school_id: '209900000005',
    full_name: 'Demo Dune',
    nickname: 'Dune',
    role: 'player',
  },
];

// Demo-only bcrypt hash; never use for a real account.
const DEMO_PASSWORD_HASH =
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

module.exports = {
  async up(queryInterface) {
    const createdAt = new Date();

    await queryInterface.bulkInsert(
      'users',
      DEMO_USERS.map((user) => ({
        ...user,
        password_hash: DEMO_PASSWORD_HASH,
        created_at: createdAt,
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'users',
      {
        email: {
          [Sequelize.Op.in]: DEMO_USERS.map((user) => user.email),
        },
      },
      {}
    );
  },
};