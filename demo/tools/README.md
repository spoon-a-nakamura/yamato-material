# データ変換スクリプト

```bash
pip install openpyxl
python3 convert.py        # xlsx → products.real.json / data-issues.json
python3 build_dataset.py  # + 誌面対応表 + デモデータ → dataset.json
cp ../data/dataset.json ../src/data/dataset.json
```

入力ファイルのパスはスクリプト冒頭の `SRC` / `CSV_SRC` に直書きしています。
本番では管理画面がこの役割を担うため、これらは初期データ投入用の暫定スクリプトです。
