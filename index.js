

const file = document.getElementById('file-upload');
const tableNameElement = document.getElementById('table-name');
const columnInfoElem = document.getElementById('column-info');
let columnInfo = null;

function str2Array(str) {
  var array = [],i,il=str.length;
  for(i=0;i<il;i++) array.push(str.charCodeAt(i));
  return array;
}

const toCsvText = (result) => {
  const sjisArray = str2Array(result);
  const uniArray = Encoding.convert(sjisArray, 'UNICODE', 'SJIS');
  const text = Encoding.codeToString(uniArray);

  return text;
}


columnInfoElem.addEventListener('change', (ev) => {
  const read = new FileReader();
  read.readAsBinaryString(ev.target.files[0]);

  read.onload = (event) => {
    const text = toCsvText(event.target.result);
    const rows = text.split(/\n/);
    const detail = rows.splice(1);

    const results = detail.map(d => {
      const _row = d.split(',');

      return {
        name: _row[0],
        type: _row[1],
      }
    });
    columnInfo = results;
  };
})

const convertValue = (value, headerName) => {
  const finishConvert = () => value === '' ? 'null' : value;

  if (columnInfo == null) {
    return finishConvert();
  }
  const target = columnInfo.find(x =>x.name === headerName);
  if (target == null) {
    return finishConvert();
  }
  if (target.type === 'NUMBER') {
    return finishConvert();
  } else {
    if (value === '') {
      return finishConvert();
    }
    return `'${value}'`;
  }
}


file.addEventListener('change', (ev) => {

  const tableName = tableNameElement.value;
  const reader = new FileReader();
  reader.readAsBinaryString(ev.target.files[0]);

  reader.onload = (event) => {
    const text = toCsvText(event.target.result);
    
    const rows = text.split(/\n/);
    const headerArray = rows[0].split(',');
    const header = headerArray.map(x => x.replace(/"/g, ''));
    const body = rows.splice(1);

    const sqlSentence = `INSERT INTO ${tableName} (${header.join(',')})`;

    const sql = body.map((item) => {
      const row = item.split(',').map(m => m.replace(/"/g, ''));
      console.log(`[log] row.length is ${row.length} `);

      const values = row.map((r, i) => convertValue(r, header[i]));
      const addEmptyCell = () => {
        if (values.length === header.length) {
          return;
        }
        values.push('null');
        addEmptyCell();
      };
      addEmptyCell();
      
      return `${sqlSentence} VALUES(${values});`;
    });

    const resultArea = document.getElementById('result-area');
    resultArea.innerText = sql.join('\n');
    
  };
});