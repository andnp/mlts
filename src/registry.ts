import { registerAlgorithm, registerDataset, registerTransformation } from './experiments/ExperimentRegistry';

// --------
// Datasets
// --------
import { GreyCifar10 } from './data/tensorflow/GreyCifar10';
import { Deterding } from './data/tensorflow/Deterding';
import { SusyComplete } from './data/tensorflow/SusyComplete';
import { Mnist } from './data/tensorflow/mnist';
import { FashionMnist } from './data/tensorflow/FashionMnist';

// ----------
// Algorithms
// ----------
import { TwoStageDictionaryLearning, TwoStageDictionaryLearningMetaParametersSchema } from './algorithms/TwoStageDictionaryLearning';
import { SupervisedDictionaryLearning, SupervisedDictionaryLearningMetaParameterSchema } from './algorithms/SupervisedDictionaryLearning';
import { LogisticRegression, LogisticRegressionMetaParameterSchema } from './algorithms/LogisticRegression';
import { LinearRegression, LinearRegressionMetaParameterSchema } from './algorithms/LinearRegression';
import { SupervisedAutoencoder, SupervisedAutoencoderMetaParameterSchema } from './algorithms/SupervisedAutoencoder';
import { TwoStageAutoencoder, TwoStageAutoencoderMetaParameterSchema } from './algorithms/TwoStageAutoencoder';
import { ANN, ANNMetaParameterSchema } from './algorithms/ANN';
import { MatrixFactorization, MatrixFactorizationMetaParametersSchema } from './algorithms/MatrixFactorization';

// ---------------
// Transformations
// ---------------
import { GaussianKernelTransformation, GaussianKernelParametersSchema } from './transformations/GaussianKernel';

// --------
// Registry
// --------
registerAlgorithm('ann', ANN, ANNMetaParameterSchema);
registerAlgorithm('twostage', TwoStageDictionaryLearning, TwoStageDictionaryLearningMetaParametersSchema);
registerAlgorithm('sdl', SupervisedDictionaryLearning, SupervisedDictionaryLearningMetaParameterSchema);
registerAlgorithm('logisticRegression', LogisticRegression, LogisticRegressionMetaParameterSchema);
registerAlgorithm('linearRegression', LinearRegression, LinearRegressionMetaParameterSchema);
registerAlgorithm('sae', SupervisedAutoencoder, SupervisedAutoencoderMetaParameterSchema);
registerAlgorithm('twostage-ae', TwoStageAutoencoder, TwoStageAutoencoderMetaParameterSchema);
registerAlgorithm('matrix_factorization', MatrixFactorization, MatrixFactorizationMetaParametersSchema);
registerDataset('cifar', GreyCifar10);
registerDataset('deterding', Deterding);
registerDataset('susy', SusyComplete);
registerDataset('mnist', Mnist);
registerDataset('fashion_mnist', FashionMnist);
registerTransformation('GaussianKernel', GaussianKernelTransformation, GaussianKernelParametersSchema);
