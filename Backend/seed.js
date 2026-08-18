const { Sequelize, DataTypes } = require('sequelize');

// Ajuste a senha do seu banco no 3º parâmetro se necessário
const sequelize = new Sequelize('saep_saude', 'postgres', 'senai', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

const Usuario = sequelize.define('Usuario', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  senha: { type: DataTypes.STRING, allowNull: false }
});

const Atividade = sequelize.define('Atividade', {
  tipo: DataTypes.STRING,
  distancia_m: DataTypes.INTEGER,
  duracao_min: DataTypes.INTEGER,
  curtidas_count: { type: DataTypes.INTEGER, defaultValue: 0 }
});

async function popularBanco() {
  try {
    await sequelize.sync();

    console.log('\n========================================');
    console.log('       CRIANDO USUÁRIOS DE TESTE        ');
    console.log('========================================');

    // Gerar 3 usuários aleatórios
    for (let i = 1; i <= 3; i++) {
      const email = `usuario0${i}@email.com`;
      const senha = `senha${Math.floor(1000 + Math.random() * 9000)}`;

      const [usuario, criado] = await Usuario.findOrCreate({
        where: { email },
        defaults: { senha }
      });

      if (criado) {
        console.log(`[CRIADO]  Email: ${email}  |  Senha: ${senha}`);
      } else {
        console.log(`[EXISTE]  Email: ${email}  |  Senha cadastrada anteriormente`);
      }
    }

    // Criar atividades padrão caso não existam
    const qtdAtividades = await Atividade.count();
    if (qtdAtividades === 0) {
      await Atividade.bulkCreate([
        { tipo: 'Corrida', distancia_m: 5000, duracao_min: 30, curtidas_count: 12 },
        { tipo: 'Trilha', distancia_m: 10000, duracao_min: 50, curtidas_count: 5 },
        { tipo: 'Caminhada', distancia_m: 3000, duracao_min: 45, curtidas_count: 3 },
        { tipo: 'Corrida', distancia_m: 8000, duracao_min: 50, curtidas_count: 20 },
      ]);
      console.log('\n[INFO] Atividades iniciais cadastradas com sucesso!');
    }

    console.log('========================================\n');

  } catch (error) {
    console.error('Erro ao executar o seed:', error.message);
  } finally {
    await sequelize.close();
  }
}

popularBanco();