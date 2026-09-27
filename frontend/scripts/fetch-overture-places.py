# Overture places inside a bounding box, as GeoJSONL for import-overture-places.mjs:
#   python scripts/fetch-overture-places.py 84.95 25.52 85.30 25.68 patna-places.geojsonl
# The overturemaps CLI finds nothing (its STAC index has no collection column), so
# this reads the one parquet file covering 73-107°E directly; the bbox filter lets
# pyarrow fetch only the matching row groups. Needs: pip install pyarrow
# Overture drops old releases: for a newer one, list theme=places/type=place/ in the
# bucket and take the part whose bbox covers Bihar.
import json, sys, time
import pyarrow.dataset as ds, pyarrow.fs as fs, pyarrow.compute as pc

RELEASE = "2026-08-19.0"
KEY = f"overturemaps-us-west-2/release/{RELEASE}/theme=places/type=place/part-00014-5fafa875-a2eb-5f25-80ec-8c003f666ae6-c000.zstd.parquet"
XMIN, YMIN, XMAX, YMAX = map(float, sys.argv[1:5])
out = sys.argv[5]

t0 = time.time()
dataset = ds.dataset([KEY], filesystem=fs.S3FileSystem(anonymous=True, region="us-west-2"))
bbox = (pc.field("bbox", "xmin") < XMAX) & (pc.field("bbox", "xmax") > XMIN) & (pc.field("bbox", "ymin") < YMAX) & (pc.field("bbox", "ymax") > YMIN)
cols = ["id", "names", "categories", "confidence", "websites", "socials", "phones", "brand", "addresses", "bbox"]
table = dataset.to_table(filter=bbox, columns=[c for c in cols if c in dataset.schema.names])
print(f"{table.num_rows} places in {time.time() - t0:.0f}s", flush=True)

with open(out, "w", encoding="utf-8") as f:
    for row in table.to_pylist():
        b = row.pop("bbox")
        f.write(json.dumps({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [(b["xmin"] + b["xmax"]) / 2, (b["ymin"] + b["ymax"]) / 2]},
            "properties": row,
        }, ensure_ascii=False) + "\n")
print("wrote", out)
