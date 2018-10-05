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
import { SupervisedAutoencoder, SupervisedAutoencoderMetaParameterSchema } from './algorithms/SupervisedAutoencoder';
import { TwoStageAutoencoder, TwoStageAutoencoderMetaParameterSchema } from './algorithms/TwoStageAutoencoder';

// ---------------
// Transformations
// ---------------
import { GaussianKernelTransformation, GaussianKernelParametersSchema } from './transformations/GaussianKernel';

// --------
// Registry
// --------
registerAlgorithm('twostage', TwoStageDictionaryLearning, TwoStageDictionaryLearningMetaParametersSchema);
registerAlgorithm('sdl', SupervisedDictionaryLearning, SupervisedDictionaryLearningMetaParameterSchema);
registerAlgorithm('logisticRegression', LogisticRegression, LogisticRegressionMetaParameterSchema);
registerAlgorithm('sae', SupervisedAutoencoder, SupervisedAutoencoderMetaParameterSchema);
registerAlgorithm('twostage-ae', TwoStageAutoencoder, TwoStageAutoencoderMetaParameterSchema);
registerDataset('cifar', GreyCifar10);
registerDataset('deterding', Deterding);
registerDataset('susy', SusyComplete);
registerDataset('mnist', Mnist);
registerDataset('fashion_mnist', FashionMnist);
registerTransformation('GaussianKernel', GaussianKernelTransformation, GaussianKernelParametersSchema);
