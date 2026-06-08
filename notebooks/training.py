import pandas as pd
import numpy as np
import os
import joblib
import xgboost as xgb
import optuna
import shap
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                             f1_score, confusion_matrix, roc_auc_score, classification_report)

def main():
    # 1. Load dataset (Disesuaikan ke path root)
    dataset_path = '../dataset/student_dropout_prediction_dataset.csv'
    if not os.path.exists(dataset_path):
        print(f"❌ Error: Dataset not found at {dataset_path}")
        return
    
    print(f"📂 Loading real dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)

    # 1b. Rescale Attendance_Rate to 0-1 range
    if df['Attendance_Rate'].max() > 1.0:
        print("⚖️ Rescaling Attendance_Rate from 0-100 to 0-1 range...")
        df['Attendance_Rate'] = df['Attendance_Rate'] / 100.0

    # 2. Pisahkan X dan y
    X = df.drop(columns=['Student_ID', 'Dropout_Label'])
    y = df['Dropout_Label'].map({'Yes': 1, 'No': 0})

    # 3. Preprocessing Transformer
    categorical_features = ['Payment_Status']
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ],
        remainder='passthrough'
    )

    # 4. Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 5. Hyperparameter Tuning with Optuna
    print("\n🧪 Starting Hyperparameter Tuning with Optuna...")
    
    def objective(trial):
        params = {
            'n_estimators': trial.suggest_int('n_estimators', 50, 300),
            'max_depth': trial.suggest_int('max_depth', 3, 10),
            'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
            'subsample': trial.suggest_float('subsample', 0.5, 1.0),
            'colsample_bytree': trial.suggest_float('colsample_bytree', 0.5, 1.0),
            'scale_pos_weight': (y_train == 0).sum() / (y_train == 1).sum(),
            'random_state': 42,
            'use_label_encoder': False,
            'eval_metric': 'logloss'
        }
        
        X_train_transformed = preprocessor.fit_transform(X_train)
        clf = xgb.XGBClassifier(**params)
        score = cross_val_score(clf, X_train_transformed, y_train, n_jobs=-1, cv=3, scoring='f1').mean()
        return score

    study = optuna.create_study(direction='maximize')
    study.optimize(objective, n_trials=10)

    print(f"✅ Best Trial: {study.best_trial.params}")

    # 6. Train Final Pipeline with Best Parameters
    print("\n📉 Training final model with best parameters...")
    final_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', xgb.XGBClassifier(
            **study.best_params,
            random_state=42,
            eval_metric='logloss',
            scale_pos_weight=(y_train == 0).sum() / (y_train == 1).sum()
        ))
    ])
    final_pipeline.fit(X_train, y_train)

    print(f"🌲 Final model trained successfully.")

    # --- SIMPAN DATASET SETELAH PREPROCESSING ---
    print("\n💾 Saving dataset after preprocessing...")
    X_transformed = final_pipeline.named_steps['preprocessor'].transform(X)
    
    cat_ohe = final_pipeline.named_steps['preprocessor'].transformers_[0][1]
    ohe_features = list(cat_ohe.get_feature_names_out(categorical_features))
    num_features = [col for col in X.columns if col not in categorical_features]
    all_features = ohe_features + num_features
    
    df_preprocessed = pd.DataFrame(X_transformed, columns=all_features)
    df_preprocessed['Dropout_Label'] = y.values
    
    save_path = '../dataset/student_dropout_prediction_after_preprocessing.csv'
    df_preprocessed.to_csv(save_path, index=False)
    print(f"✅ Preprocessed dataset saved to: {save_path}")
    # ---------------------------------------------

    # 7. Evaluasi Model
    import time

    start_time = time.time()
    y_pred = final_pipeline.predict(X_test)
    y_prob = final_pipeline.predict_proba(X_test)[:, 1]
    inference_duration = time.time() - start_time
    avg_inference_ms = (inference_duration / len(X_test)) * 1000

    acc_val = accuracy_score(y_test, y_pred)
    prec_val = precision_score(y_test, y_pred)
    rec_val = recall_score(y_test, y_pred)
    f1_val = f1_score(y_test, y_pred)
    auc_val = roc_auc_score(y_test, y_prob)

    print("\n📊 --- Evaluation Results (XGBoost + Optuna) ---")
    print(f"Accuracy      : {acc_val:.4f}")
    print(f"Precision     : {prec_val:.4f}")
    print(f"Recall        : {rec_val:.4f}")
    print(f"F1-Score      : {f1_val:.4f}")
    print(f"ROC-AUC       : {auc_val:.4f}")
    print(f"Inference Time: {inference_duration * 1000:.2f} ms (Avg: {avg_inference_ms:.4f} ms/sample)")

    # Create model directory first
    if not os.path.exists('model'):
        os.makedirs('model')

    # 8. SHAP Explanation
    print("\n🔍 Generating SHAP explanations...")
    X_test_transformed = final_pipeline.named_steps['preprocessor'].transform(X_test)
    explainer = shap.TreeExplainer(final_pipeline.named_steps['classifier'])
    shap_values = explainer.shap_values(X_test_transformed)

    plt.figure(figsize=(10, 6))
    shap.summary_plot(shap_values, X_test_transformed, feature_names=all_features, show=False)
    plt.title(f"SHAP Summary Plot (XGBoost) - Test F1-Score: {f1_val:.4f}", fontsize=12, fontweight='bold')
    plt.tight_layout()
    plt.savefig('model/shap_summary.png')
    plt.close()
    print("💾 SHAP Summary Plot saved to model/shap_summary.png")

    # 8b. Save F1-Score & Confusion Matrix visualization
    print("\n📊 Generating and saving model evaluation metrics...")
    from sklearn.metrics import ConfusionMatrixDisplay
    fig, ax = plt.subplots(figsize=(6, 6))
    ConfusionMatrixDisplay.from_predictions(
        y_test, 
        y_pred, 
        display_labels=['No Dropout', 'Dropout'], 
        cmap='Blues', 
        ax=ax
    )
    ax.set_title(
        f"Model Evaluation Metrics\n"
        f"Accuracy: {acc_val:.4f} | Precision: {prec_val:.4f} | Recall: {rec_val:.4f}\n"
        f"F1-Score: {f1_val:.4f} | ROC-AUC: {auc_val:.4f}\n"
        f"Inference Time: {inference_duration * 1000:.1f} ms (Avg: {avg_inference_ms:.3f} ms/sample)", 
        fontsize=10, 
        fontweight='bold'
    )
    plt.tight_layout()
    plt.savefig('model/f1_score.png')
    plt.close()
    print("💾 Evaluation metrics plot saved to model/f1_score.png")

    # 9. Simpan Pipeline
    model_file = 'model/dropout_pipeline.pkl'
    joblib.dump(final_pipeline, model_file)
    print(f"\n✅ Advanced XGBoost pipeline saved successfully to {model_file}")

if __name__ == "__main__":
    main()