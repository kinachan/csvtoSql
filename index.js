

const file = document.getElementById('file-upload');
const tableNameElement = document.getElementById('table-name');
const columnInfoElem = document.getElementById('column-info');
const sqlExportButton = document.getElementById('sql-export');
const resultArea = document.getElementById('result-area');

let columnInfo = null;

const str2Array = (str) => {
  let array = [];
  for (let i = 0; i < str.length; i++) {
    array.push(str.charCodeAt(i));
  }
  return array;
}

const toCsvText = (result) => {
  const sjisArray = str2Array(result);
  const uniArray = Encoding.convert(sjisArray, 'UNICODE', 'SJIS');
  const text = Encoding.codeToString(uniArray);

  return text;
}

sqlExportButton.addEventListener('click', (ev) => {
  if (resultArea.innerText === '') {
    alert('SQLの出力をしてください。');
    return;
  }

  const text = resultArea.innerText;
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([ bom, text ], { "type" : "txt" });


  const a = document.createElement('a');
  a.download = `${tableNameElement.value}.txt`;
  a.href = window.URL.createObjectURL(blob);
  a.target = '_blank';
  a.click();
  URL.revokeObjectURL(a.href);


});


columnInfoElem.addEventListener('change', (ev) => {
  const read = new FileReader();
  read.readAsBinaryString(ev.target.files[0]);

  read.onload = (event) => {
    const text = toCsvText(event.target.result);
    const rows = text.split(/\n/);
    const detail = rows.splice(1);

    const results = detail.map(d => {
      const row = d.split(',');

      return {
        name: row[0],
        type: row[1],
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
    const bodies = rows.splice(1);

    const sqlSentence = `INSERT INTO ${tableName} (${header.join(',')})`;

    const sql = bodies.map((body) => {
      const row = body.split(',').map(m => m.replace(/"/g, ''));
      const values = row.map((cell, i) => convertValue(cell, header[i]));
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


    resultArea.innerText = sql.join('\n');
  };
});