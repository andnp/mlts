"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ExperimentRegistry_1 = require("./experiments/ExperimentRegistry");
// --------
// Datasets
// --------
const GreyCifar10_1 = require("./data/tensorflow/GreyCifar10");
const Deterding_1 = require("./data/tensorflow/Deterding");
const SusyComplete_1 = require("./data/tensorflow/SusyComplete");
const mnist_1 = require("./data/tensorflow/mnist");
// ----------
// Algorithms
// ----------
const TwoStageDictionaryLearning_1 = require("./algorithms/TwoStageDictionaryLearning");
const SupervisedDictionaryLearning_1 = require("./algorithms/SupervisedDictionaryLearning");
const LogisticRegression_1 = require("./algorithms/LogisticRegression");
const SupervisedAutoencoder_1 = require("./algorithms/SupervisedAutoencoder");
const TwoStageAutoencoder_1 = require("./algorithms/TwoStageAutoencoder");
// ---------------
// Transformations
// ---------------
const GaussianKernel_1 = require("./transformations/GaussianKernel");
// --------
// Registry
// --------
ExperimentRegistry_1.registerAlgorithm('twostage', TwoStageDictionaryLearning_1.TwoStageDictionaryLearning, TwoStageDictionaryLearning_1.TwoStageDictionaryLearningMetaParametersSchema);
ExperimentRegistry_1.registerAlgorithm('sdl', SupervisedDictionaryLearning_1.SupervisedDictionaryLearning, SupervisedDictionaryLearning_1.SupervisedDictionaryLearningMetaParameterSchema);
ExperimentRegistry_1.registerAlgorithm('logisticRegression', LogisticRegression_1.LogisticRegression, LogisticRegression_1.LogisticRegressionMetaParameterSchema);
ExperimentRegistry_1.registerAlgorithm('sae', SupervisedAutoencoder_1.SupervisedAutoencoder, SupervisedAutoencoder_1.SupervisedAutoencoderMetaParameterSchema);
ExperimentRegistry_1.registerAlgorithm('twostage-ae', TwoStageAutoencoder_1.TwoStageAutoencoder, TwoStageAutoencoder_1.TwoStageAutoencoderMetaParameterSchema);
ExperimentRegistry_1.registerDataset('cifar', GreyCifar10_1.GreyCifar10);
ExperimentRegistry_1.registerDataset('deterding', Deterding_1.Deterding);
ExperimentRegistry_1.registerDataset('susy', SusyComplete_1.SusyComplete);
ExperimentRegistry_1.registerDataset('mnist', mnist_1.Mnist);
ExperimentRegistry_1.registerTransformation('GaussianKernel', GaussianKernel_1.GaussianKernelTransformation, GaussianKernel_1.GaussianKernelParametersSchema);
//# sourceMappingURL=registry.js.map